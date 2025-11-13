#!/bin/bash
#
# EBS Snapshot Scanner with Nextron Thor
#
# This script automates the process of:
# 1. Listing EBS snapshots in a specified AWS region
# 2. Optionally filtering snapshots by age (more recent than X days)
# 3. Creating volumes from snapshots
# 4. Mounting volumes read-only under unique UUID directories in /mnt/
# 5. Scanning mounted volumes with Nextron Thor scanner
# 6. Cleaning up (unmounting, detaching, and deleting volumes)
#
# Requirements:
# - AWS CLI configured with appropriate credentials
# - Nextron Thor scanner installed
# - Root/sudo access for mounting operations
# - Running on an EC2 instance in the target region
#
# Usage:
#   ./ebs-snapshot-scanner.sh -r <region> [-d <days>] [-t <thor-path>] [-o <output-dir>]
#

set -euo pipefail

# Configuration defaults
REGION=""
DAYS_FILTER=""
THOR_PATH="/opt/nextron/thor/thor64"
THOR_FLAGS=""
OUTPUT_DIR="/var/log/thor-scans"
MOUNT_BASE="/mnt"
LOG_FILE="/var/log/ebs-scanner.log"
DRY_RUN=false
MAX_CONCURRENT=1
CLEANUP_ON_ERROR=true
AWS_RETRY_ATTEMPTS=3
AWS_RETRY_DELAY=5

# Global state for error handling and cleanup
declare -g CURRENT_VOLUME_ID=""
declare -g CURRENT_DEVICE=""
declare -g CURRENT_MOUNT_POINT=""
declare -g CLEANUP_IN_PROGRESS=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*${NC}" | tee -a "$LOG_FILE" >&2
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $*${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $*${NC}" | tee -a "$LOG_FILE"
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $*" | tee -a "$LOG_FILE"
    fi
}

# Error handler for trap
error_handler() {
    local exit_code=$?
    local line_number=$1

    log_error "Script failed at line $line_number with exit code $exit_code"

    # Perform emergency cleanup if resources are allocated
    if [[ "$CLEANUP_IN_PROGRESS" == "false" ]] && [[ -n "$CURRENT_VOLUME_ID" ]]; then
        log_warning "Performing emergency cleanup due to error..."
        CLEANUP_IN_PROGRESS=true
        emergency_cleanup
    fi

    exit $exit_code
}

# Interrupt handler for trap
interrupt_handler() {
    log_warning "Script interrupted by user (Ctrl+C)"

    # Perform emergency cleanup if resources are allocated
    if [[ "$CLEANUP_IN_PROGRESS" == "false" ]] && [[ -n "$CURRENT_VOLUME_ID" ]]; then
        log_warning "Performing emergency cleanup due to interrupt..."
        CLEANUP_IN_PROGRESS=true
        emergency_cleanup
    fi

    exit 130
}

# Exit handler for trap
exit_handler() {
    local exit_code=$?

    if [[ $exit_code -ne 0 ]] && [[ "$CLEANUP_IN_PROGRESS" == "false" ]] && [[ -n "$CURRENT_VOLUME_ID" ]]; then
        log_warning "Performing cleanup on exit..."
        CLEANUP_IN_PROGRESS=true
        emergency_cleanup
    fi
}

# Emergency cleanup function
emergency_cleanup() {
    log "Starting emergency cleanup..."

    # Turn off exit on error temporarily for cleanup
    set +e

    if [[ -n "$CURRENT_MOUNT_POINT" ]] && mountpoint -q "$CURRENT_MOUNT_POINT" 2>/dev/null; then
        log "Emergency unmounting: $CURRENT_MOUNT_POINT"
        umount -f "$CURRENT_MOUNT_POINT" 2>/dev/null || umount -l "$CURRENT_MOUNT_POINT" 2>/dev/null
        rmdir "$CURRENT_MOUNT_POINT" 2>/dev/null
    fi

    if [[ -n "$CURRENT_VOLUME_ID" ]]; then
        log "Emergency detaching volume: $CURRENT_VOLUME_ID"
        aws ec2 detach-volume --region "$REGION" --volume-id "$CURRENT_VOLUME_ID" --force 2>/dev/null
        sleep 5

        log "Emergency deleting volume: $CURRENT_VOLUME_ID"
        aws ec2 delete-volume --region "$REGION" --volume-id "$CURRENT_VOLUME_ID" 2>/dev/null
    fi

    # Reset state
    CURRENT_VOLUME_ID=""
    CURRENT_DEVICE=""
    CURRENT_MOUNT_POINT=""

    set -e
    log "Emergency cleanup completed"
}

# Set up trap handlers
trap 'error_handler $LINENO' ERR
trap 'interrupt_handler' INT TERM
trap 'exit_handler' EXIT

# AWS retry wrapper function
aws_retry() {
    local attempt=1
    local max_attempts=$AWS_RETRY_ATTEMPTS
    local delay=$AWS_RETRY_DELAY
    local exit_code

    while [[ $attempt -le $max_attempts ]]; do
        log_debug "AWS API call attempt $attempt of $max_attempts: $*"

        if "$@"; then
            return 0
        else
            exit_code=$?

            if [[ $attempt -lt $max_attempts ]]; then
                log_warning "AWS API call failed (attempt $attempt/$max_attempts), retrying in ${delay}s..."
                sleep $delay
                delay=$((delay * 2))  # Exponential backoff
            else
                log_error "AWS API call failed after $max_attempts attempts"
                return $exit_code
            fi
        fi

        ((attempt++))
    done

    return $exit_code
}

# Usage information
usage() {
    cat << EOF
Usage: $0 -r <region> [OPTIONS]

Required:
  -r, --region <region>          AWS region (e.g., us-east-1)

Optional:
  -d, --days <days>              Filter snapshots more recent than X days
  -t, --thor-path <path>         Path to Thor binary (default: $THOR_PATH)
  -o, --output-dir <path>        Thor scan output directory (default: $OUTPUT_DIR)
  -s, --snapshot-ids <ids>       Comma-separated list of specific snapshot IDs to scan
  -f, --thor-flags <flags>       Additional flags to pass to Thor scanner (quoted string)
  -n, --dry-run                  Show what would be done without executing
  -c, --max-concurrent <num>     Maximum concurrent scans (default: 1)
  --no-cleanup-on-error          Don't cleanup resources if scan fails
  --debug                        Enable debug logging
  -h, --help                     Show this help message

Examples:
  # Scan all snapshots in us-east-1
  $0 -r us-east-1

  # Scan snapshots from the last 30 days
  $0 -r us-east-1 -d 30

  # Scan specific snapshots
  $0 -r us-east-1 -s snap-12345678,snap-87654321

  # Scan with custom Thor flags
  $0 -r us-east-1 -f "--quick --norescontrol"

  # Dry run to see what would be scanned
  $0 -r us-east-1 -d 7 -n

EOF
    exit 1
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -r|--region)
                REGION="$2"
                shift 2
                ;;
            -d|--days)
                DAYS_FILTER="$2"
                shift 2
                ;;
            -t|--thor-path)
                THOR_PATH="$2"
                shift 2
                ;;
            -o|--output-dir)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -s|--snapshot-ids)
                SNAPSHOT_IDS="$2"
                shift 2
                ;;
            -f|--thor-flags)
                THOR_FLAGS="$2"
                shift 2
                ;;
            -n|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -c|--max-concurrent)
                MAX_CONCURRENT="$2"
                shift 2
                ;;
            --no-cleanup-on-error)
                CLEANUP_ON_ERROR=false
                shift
                ;;
            --debug)
                DEBUG=true
                shift
                ;;
            -h|--help)
                usage
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$REGION" ]]; then
        log_error "Region is required"
        usage
    fi
}

# Check AWS CLI installation and version
check_aws_cli() {
    log "Checking AWS CLI..."

    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        log_error "Please install AWS CLI: https://aws.amazon.com/cli/"
        return 1
    fi

    # Get AWS CLI version
    local aws_version=$(aws --version 2>&1 | cut -d ' ' -f1 | cut -d '/' -f2)
    log "AWS CLI version: $aws_version"

    # Check if version is at least 1.x or 2.x
    local major_version=$(echo "$aws_version" | cut -d '.' -f1)
    if [[ "$major_version" -lt 1 ]]; then
        log_warning "AWS CLI version is very old. Please consider upgrading."
    fi

    log_success "AWS CLI is installed"
    return 0
}

# Check IAM permissions
check_iam_permissions() {
    log "Checking IAM permissions..."

    local permission_errors=0

    # Get caller identity for logging
    local caller_identity=$(aws sts get-caller-identity --region "$REGION" --output json 2>/dev/null)
    if [[ $? -ne 0 ]]; then
        log_error "Cannot retrieve caller identity. Check AWS credentials."
        return 1
    fi

    local caller_arn=$(echo "$caller_identity" | grep -o '"Arn": "[^"]*"' | cut -d '"' -f4)
    local account_id=$(echo "$caller_identity" | grep -o '"Account": "[^"]*"' | cut -d '"' -f4)
    log "AWS Account: $account_id"
    log "IAM Identity: $caller_arn"

    # Test ec2:DescribeSnapshots
    log_debug "Testing ec2:DescribeSnapshots permission..."
    if aws ec2 describe-snapshots --region "$REGION" --owner-ids self --max-results 1 --output json &>/dev/null; then
        log_success "✓ ec2:DescribeSnapshots"
    else
        log_error "✗ ec2:DescribeSnapshots - Permission denied"
        ((permission_errors++))
    fi

    # Test ec2:DescribeVolumes
    log_debug "Testing ec2:DescribeVolumes permission..."
    if aws ec2 describe-volumes --region "$REGION" --max-results 1 --output json &>/dev/null; then
        log_success "✓ ec2:DescribeVolumes"
    else
        log_error "✗ ec2:DescribeVolumes - Permission denied"
        ((permission_errors++))
    fi

    # Test ec2:CreateVolume (dry-run)
    log_debug "Testing ec2:CreateVolume permission..."
    local test_result=$(aws ec2 create-volume \
        --region "$REGION" \
        --availability-zone "${AVAILABILITY_ZONE}" \
        --size 1 \
        --dry-run 2>&1)

    if echo "$test_result" | grep -q "DryRunOperation"; then
        log_success "✓ ec2:CreateVolume"
    elif echo "$test_result" | grep -q "UnauthorizedOperation"; then
        log_error "✗ ec2:CreateVolume - Permission denied"
        ((permission_errors++))
    else
        log_warning "⚠ ec2:CreateVolume - Unable to verify (may work in practice)"
    fi

    # Test ec2:AttachVolume (dry-run)
    log_debug "Testing ec2:AttachVolume permission..."
    test_result=$(aws ec2 attach-volume \
        --region "$REGION" \
        --volume-id vol-00000000000000000 \
        --instance-id "${INSTANCE_ID}" \
        --device /dev/sdx \
        --dry-run 2>&1)

    if echo "$test_result" | grep -q "DryRunOperation"; then
        log_success "✓ ec2:AttachVolume"
    elif echo "$test_result" | grep -q "UnauthorizedOperation"; then
        log_error "✗ ec2:AttachVolume - Permission denied"
        ((permission_errors++))
    else
        log_warning "⚠ ec2:AttachVolume - Unable to verify (may work in practice)"
    fi

    # Test ec2:DetachVolume (dry-run)
    log_debug "Testing ec2:DetachVolume permission..."
    test_result=$(aws ec2 detach-volume \
        --region "$REGION" \
        --volume-id vol-00000000000000000 \
        --dry-run 2>&1)

    if echo "$test_result" | grep -q "DryRunOperation"; then
        log_success "✓ ec2:DetachVolume"
    elif echo "$test_result" | grep -q "UnauthorizedOperation"; then
        log_error "✗ ec2:DetachVolume - Permission denied"
        ((permission_errors++))
    else
        log_warning "⚠ ec2:DetachVolume - Unable to verify (may work in practice)"
    fi

    # Test ec2:DeleteVolume (dry-run)
    log_debug "Testing ec2:DeleteVolume permission..."
    test_result=$(aws ec2 delete-volume \
        --region "$REGION" \
        --volume-id vol-00000000000000000 \
        --dry-run 2>&1)

    if echo "$test_result" | grep -q "DryRunOperation"; then
        log_success "✓ ec2:DeleteVolume"
    elif echo "$test_result" | grep -q "UnauthorizedOperation"; then
        log_error "✗ ec2:DeleteVolume - Permission denied"
        ((permission_errors++))
    else
        log_warning "⚠ ec2:DeleteVolume - Unable to verify (may work in practice)"
    fi

    # Test ec2:CreateTags (dry-run)
    log_debug "Testing ec2:CreateTags permission..."
    test_result=$(aws ec2 create-tags \
        --region "$REGION" \
        --resources vol-00000000000000000 \
        --tags Key=Test,Value=Test \
        --dry-run 2>&1)

    if echo "$test_result" | grep -q "DryRunOperation"; then
        log_success "✓ ec2:CreateTags"
    elif echo "$test_result" | grep -q "UnauthorizedOperation"; then
        log_error "✗ ec2:CreateTags - Permission denied"
        ((permission_errors++))
    else
        log_warning "⚠ ec2:CreateTags - Unable to verify (may work in practice)"
    fi

    if [[ $permission_errors -gt 0 ]]; then
        log_error "IAM permission check failed: $permission_errors permission(s) missing"
        log_error "Please ensure the IAM role/user has the required EC2 permissions"
        log_error "See README.md for the required IAM policy"
        return 1
    fi

    log_success "All required IAM permissions verified"
    return 0
}

# Check prerequisites
check_prerequisites() {
    log "=========================================="
    log "Prerequisites Check"
    log "=========================================="

    # Check if running as root
    if [[ $EUID -ne 0 ]] && [[ "$DRY_RUN" == false ]]; then
        log_error "This script must be run as root for mounting operations"
        log_error "Please run with: sudo $0"
        exit 1
    fi

    # Check AWS CLI
    if ! check_aws_cli; then
        exit 1
    fi

    # Verify AWS credentials
    log "Verifying AWS credentials..."
    if ! aws sts get-caller-identity --region "$REGION" &> /dev/null; then
        log_error "AWS credentials not configured or invalid"
        log_error "Please configure AWS credentials using 'aws configure' or IAM role"
        exit 1
    fi
    log_success "AWS credentials valid"

    # Get instance ID and availability zone
    log "Detecting EC2 instance metadata..."
    INSTANCE_ID=$(ec2-metadata --instance-id 2>/dev/null | cut -d ' ' -f 2 || curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
    AVAILABILITY_ZONE=$(ec2-metadata --availability-zone 2>/dev/null | cut -d ' ' -f 2 || curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone 2>/dev/null)

    if [[ -z "$INSTANCE_ID" ]]; then
        log_error "Could not determine EC2 instance ID"
        log_error "This script must run on an EC2 instance in the target region"
        log_error "Ensure instance metadata service is accessible"
        exit 1
    fi

    log "Instance ID: $INSTANCE_ID"
    log "Availability Zone: $AVAILABILITY_ZONE"

    # Check IAM permissions
    if ! check_iam_permissions; then
        exit 1
    fi

    # Check Thor scanner
    log "Checking Thor scanner..."
    if [[ ! -f "$THOR_PATH" ]] && [[ "$DRY_RUN" == false ]]; then
        log_error "Thor scanner not found at: $THOR_PATH"
        log_error "Please install Thor or specify correct path with -t option"
        log_error "Download from: https://www.nextron-systems.com/thor/"
        exit 1
    fi

    if [[ -f "$THOR_PATH" ]]; then
        # Check if Thor is executable
        if [[ ! -x "$THOR_PATH" ]]; then
            log_error "Thor scanner at $THOR_PATH is not executable"
            log_error "Run: chmod +x $THOR_PATH"
            exit 1
        fi

        # Try to get Thor version
        local thor_version=$("$THOR_PATH" --version 2>/dev/null | head -n1 || echo "unknown")
        log "Thor scanner: $thor_version"
        log_success "Thor scanner is ready"
    fi

    # Check required system utilities
    log "Checking system utilities..."
    local missing_utils=()

    for util in mountpoint blkid uuidgen; do
        if ! command -v "$util" &> /dev/null; then
            missing_utils+=("$util")
        fi
    done

    if [[ ${#missing_utils[@]} -gt 0 ]]; then
        log_error "Missing required system utilities: ${missing_utils[*]}"
        log_error "Please install the missing utilities"
        exit 1
    fi
    log_success "All system utilities present"

    # Create output directory
    log "Creating output directory..."
    if ! mkdir -p "$OUTPUT_DIR" 2>/dev/null; then
        log_error "Failed to create output directory: $OUTPUT_DIR"
        exit 1
    fi
    log_success "Output directory: $OUTPUT_DIR"

    log "=========================================="
    log_success "All prerequisites met - ready to scan"
    log "=========================================="
    echo ""
}

# List EBS snapshots with optional filtering
list_snapshots() {
    log "Listing EBS snapshots in region: $REGION"

    local query="Snapshots[*].[SnapshotId,StartTime,VolumeSize,Description]"
    local filter_args=""

    # If specific snapshot IDs provided, use them
    if [[ -n "${SNAPSHOT_IDS:-}" ]]; then
        log "Filtering for specific snapshot IDs: $SNAPSHOT_IDS"
        local snapshot_array=(${SNAPSHOT_IDS//,/ })
        local snapshots=()
        for snap_id in "${snapshot_array[@]}"; do
            snapshots+=("$snap_id")
        done
        echo "${snapshots[@]}"
        return
    fi

    # Build filter for date if specified
    if [[ -n "$DAYS_FILTER" ]]; then
        local cutoff_date=$(date -u -d "$DAYS_FILTER days ago" '+%Y-%m-%dT%H:%M:%S')
        log "Filtering for snapshots more recent than: $cutoff_date"
        filter_args="--filters Name=start-time,Values=${cutoff_date}..*"
    fi

    # Query snapshots
    local snapshots=$(aws ec2 describe-snapshots \
        --region "$REGION" \
        --owner-ids self \
        $filter_args \
        --query "$query" \
        --output text | awk '{print $1}')

    if [[ -z "$snapshots" ]]; then
        log_warning "No snapshots found matching criteria"
        return 1
    fi

    local count=$(echo "$snapshots" | wc -l)
    log_success "Found $count snapshot(s) to process"

    echo "$snapshots"
}

# Get next available device name
get_available_device() {
    local devices=(/dev/xvdf /dev/xvdg /dev/xvdh /dev/xvdi /dev/xvdj /dev/xvdk /dev/xvdl /dev/xvdm /dev/xvdn /dev/xvdo /dev/xvdp)

    for device in "${devices[@]}"; do
        if [[ ! -b "$device" ]]; then
            echo "$device"
            return 0
        fi
    done

    log_error "No available device names"
    return 1
}

# Create volume from snapshot
create_volume_from_snapshot() {
    local snapshot_id=$1

    log "Creating volume from snapshot: $snapshot_id"

    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would create volume from snapshot: $snapshot_id"
        echo "vol-dryrun123456"
        return 0
    fi

    local volume_id
    if ! volume_id=$(aws_retry aws ec2 create-volume \
        --region "$REGION" \
        --availability-zone "$AVAILABILITY_ZONE" \
        --snapshot-id "$snapshot_id" \
        --volume-type gp3 \
        --tag-specifications "ResourceType=volume,Tags=[{Key=Name,Value=thor-scan-temp},{Key=SnapshotId,Value=$snapshot_id},{Key=CreatedBy,Value=ebs-scanner}]" \
        --query 'VolumeId' \
        --output text); then
        log_error "Failed to create volume from snapshot: $snapshot_id after retries"
        return 1
    fi

    if [[ -z "$volume_id" ]]; then
        log_error "Created volume ID is empty for snapshot: $snapshot_id"
        return 1
    fi

    log "Created volume: $volume_id"

    # Wait for volume to be available
    log "Waiting for volume to become available..."
    if ! aws_retry aws ec2 wait volume-available --region "$REGION" --volume-ids "$volume_id"; then
        log_error "Volume $volume_id did not become available in time"
        return 1
    fi

    log_success "Volume $volume_id is ready"
    echo "$volume_id"
}

# Attach volume to instance
attach_volume() {
    local volume_id=$1
    local device=$2

    log "Attaching volume $volume_id to $INSTANCE_ID as $device"

    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would attach volume: $volume_id"
        return 0
    fi

    if ! aws_retry aws ec2 attach-volume \
        --region "$REGION" \
        --volume-id "$volume_id" \
        --instance-id "$INSTANCE_ID" \
        --device "$device" > /dev/null; then
        log_error "Failed to attach volume $volume_id after retries"
        return 1
    fi

    # Wait for volume to be attached
    log "Waiting for volume to attach..."
    if ! aws_retry aws ec2 wait volume-in-use --region "$REGION" --volume-ids "$volume_id"; then
        log_error "Volume $volume_id did not attach in time"
        return 1
    fi

    # Wait for device to appear in the system
    local max_wait=30
    local count=0
    while [[ ! -b "$device" ]] && [[ $count -lt $max_wait ]]; do
        sleep 1
        ((count++))
    done

    if [[ ! -b "$device" ]]; then
        log_error "Device $device did not appear after $max_wait seconds"
        return 1
    fi

    log_success "Volume attached successfully"
}

# Mount volume read-only
mount_volume() {
    local device=$1
    local mount_point=$2

    log "Mounting $device to $mount_point (read-only)"

    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would mount device: $device"
        return 0
    fi

    # Create mount point
    mkdir -p "$mount_point"

    # Try to detect filesystem type and mount
    local fs_type=$(blkid -o value -s TYPE "$device" 2>/dev/null || echo "")

    if [[ -z "$fs_type" ]]; then
        # If it's a partitioned disk, try the first partition
        if [[ -b "${device}1" ]]; then
            device="${device}1"
            fs_type=$(blkid -o value -s TYPE "$device" 2>/dev/null || echo "")
        fi
    fi

    if [[ -z "$fs_type" ]]; then
        log_warning "Could not detect filesystem type for $device, trying auto"
        mount -o ro,noexec,nodev,nosuid "$device" "$mount_point" 2>/dev/null || {
            log_error "Failed to mount $device"
            return 1
        }
    else
        log "Detected filesystem type: $fs_type"
        mount -t "$fs_type" -o ro,noexec,nodev,nosuid "$device" "$mount_point" 2>/dev/null || {
            log_error "Failed to mount $device as $fs_type"
            return 1
        }
    fi

    log_success "Volume mounted successfully"
}

# Run Thor scanner on mounted volume
scan_with_thor() {
    local mount_point=$1
    local snapshot_id=$2
    local scan_uuid=$3

    log "Starting Thor scan on $mount_point"

    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would scan: $mount_point"
        return 0
    fi

    local output_file="$OUTPUT_DIR/thor-scan-${snapshot_id}-${scan_uuid}.html"
    local log_file="$OUTPUT_DIR/thor-scan-${snapshot_id}-${scan_uuid}.log"

    # Thor scanner command with forensic lab options
    # Using --lab mode for forensic analysis of mounted volumes
    # Adjust options based on your Thor license and requirements
    local thor_base_cmd="$THOR_PATH \
        --lab \
        -p \"$mount_point\" \
        --htmlfile \"$output_file\" \
        --logfile \"$log_file\" \
        --allreasons \
        --intense \
        --fsonly"

    # Append custom Thor flags if provided
    local thor_cmd="$thor_base_cmd"
    if [[ -n "$THOR_FLAGS" ]]; then
        log "Appending custom Thor flags: $THOR_FLAGS"
        thor_cmd="$thor_cmd $THOR_FLAGS"
    fi

    log "Executing Thor scan command"
    log_debug "Thor command: $thor_cmd"

    # Run Thor scanner with error handling
    local exit_code=0
    if eval "$thor_cmd"; then
        log_success "Thor scan completed successfully"
    else
        exit_code=$?
        if [[ $exit_code -eq 1 ]]; then
            log_warning "Thor scan completed with findings (exit code: $exit_code)"
            log "This typically indicates threats or suspicious items were detected"
        elif [[ $exit_code -eq 2 ]]; then
            log_warning "Thor scan completed with errors (exit code: $exit_code)"
        else
            log_warning "Thor scan completed with exit code: $exit_code"
        fi
        log "Consult Thor documentation for exit code meanings"
    fi

    # Check if report files were created
    if [[ -f "$output_file" ]]; then
        log "Scan HTML report: $output_file"
    else
        log_warning "HTML report was not created: $output_file"
    fi

    if [[ -f "$log_file" ]]; then
        log "Scan log file: $log_file"
    else
        log_warning "Log file was not created: $log_file"
    fi

    return 0  # Don't fail the script on Thor findings
}

# Cleanup resources
cleanup_volume() {
    local volume_id=$1
    local device=$2
    local mount_point=$3

    log "Cleaning up resources..."

    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would cleanup volume: $volume_id"
        return 0
    fi

    # Unmount
    if mountpoint -q "$mount_point" 2>/dev/null; then
        log "Unmounting $mount_point"
        umount "$mount_point" || log_warning "Failed to unmount $mount_point"
    fi

    # Remove mount point
    if [[ -d "$mount_point" ]]; then
        rmdir "$mount_point" 2>/dev/null || log_warning "Failed to remove mount point $mount_point"
    fi

    # Detach volume
    local volume_state
    volume_state=$(aws ec2 describe-volumes --region "$REGION" --volume-ids "$volume_id" --query 'Volumes[0].State' --output text 2>/dev/null || echo "unknown")

    if [[ "$volume_state" == "in-use" ]]; then
        log "Detaching volume $volume_id"
        if ! aws_retry aws ec2 detach-volume --region "$REGION" --volume-id "$volume_id" > /dev/null; then
            log_warning "Failed to detach volume after retries"
        else
            # Wait for volume to detach
            log "Waiting for volume to detach..."
            aws_retry aws ec2 wait volume-available --region "$REGION" --volume-ids "$volume_id" 2>/dev/null || log_warning "Volume did not detach in expected time"
        fi
    fi

    # Delete volume
    log "Deleting volume $volume_id"
    if ! aws_retry aws ec2 delete-volume --region "$REGION" --volume-id "$volume_id"; then
        log_error "Failed to delete volume $volume_id after retries"
        log_error "Please manually delete volume $volume_id to avoid charges"
    else
        log_success "Volume $volume_id deleted successfully"
    fi

    log_success "Cleanup completed for volume $volume_id"
}

# Process a single snapshot
process_snapshot() {
    local snapshot_id=$1
    local scan_uuid=$(uuidgen || cat /proc/sys/kernel/random/uuid)
    local mount_point="$MOUNT_BASE/ebs-scan-$scan_uuid"
    local volume_id=""
    local device=""

    log "=========================================="
    log "Processing snapshot: $snapshot_id"
    log "Scan UUID: $scan_uuid"
    log "=========================================="

    # Create volume
    volume_id=$(create_volume_from_snapshot "$snapshot_id")
    if [[ $? -ne 0 ]] || [[ -z "$volume_id" ]]; then
        log_error "Failed to create volume from snapshot: $snapshot_id"
        return 1
    fi

    # Update global state for error handling
    CURRENT_VOLUME_ID="$volume_id"

    # Get available device
    device=$(get_available_device)
    if [[ $? -ne 0 ]] || [[ -z "$device" ]]; then
        log_error "No available device for snapshot: $snapshot_id"
        cleanup_volume "$volume_id" "" ""
        CURRENT_VOLUME_ID=""
        return 1
    fi

    CURRENT_DEVICE="$device"

    # Attach volume
    if ! attach_volume "$volume_id" "$device"; then
        log_error "Failed to attach volume: $volume_id"
        cleanup_volume "$volume_id" "" ""
        CURRENT_VOLUME_ID=""
        CURRENT_DEVICE=""
        return 1
    fi

    # Mount volume
    CURRENT_MOUNT_POINT="$mount_point"
    if ! mount_volume "$device" "$mount_point"; then
        log_error "Failed to mount volume: $volume_id"
        cleanup_volume "$volume_id" "$device" "$mount_point"
        CURRENT_VOLUME_ID=""
        CURRENT_DEVICE=""
        CURRENT_MOUNT_POINT=""
        return 1
    fi

    # Scan with Thor
    local scan_result=0
    if ! scan_with_thor "$mount_point" "$snapshot_id" "$scan_uuid"; then
        log_error "Thor scan failed for snapshot: $snapshot_id"
        scan_result=1
    fi

    # Cleanup
    CLEANUP_IN_PROGRESS=true
    cleanup_volume "$volume_id" "$device" "$mount_point"

    # Reset global state after cleanup
    CURRENT_VOLUME_ID=""
    CURRENT_DEVICE=""
    CURRENT_MOUNT_POINT=""
    CLEANUP_IN_PROGRESS=false

    if [[ $scan_result -eq 0 ]]; then
        log_success "Snapshot $snapshot_id processed successfully"
    else
        log_error "Snapshot $snapshot_id processing failed"
        return 1
    fi

    return 0
}

# Main function
main() {
    log "=========================================="
    log "EBS Snapshot Scanner with Thor"
    log "=========================================="

    parse_args "$@"
    check_prerequisites

    # Get list of snapshots
    local snapshots
    if ! snapshots=$(list_snapshots); then
        log_error "Failed to list snapshots"
        exit 1
    fi

    # Process each snapshot
    local total=0
    local success=0
    local failed=0

    for snapshot_id in $snapshots; do
        ((total++))

        if process_snapshot "$snapshot_id"; then
            ((success++))
        else
            ((failed++))
            if [[ "$CLEANUP_ON_ERROR" == false ]]; then
                log_warning "Continuing despite error (--no-cleanup-on-error specified)"
            fi
        fi

        # Small delay between scans
        if [[ "$DRY_RUN" == false ]]; then
            sleep 5
        fi
    done

    log "=========================================="
    log "Scan Summary"
    log "=========================================="
    log "Total snapshots processed: $total"
    log_success "Successful scans: $success"
    if [[ $failed -gt 0 ]]; then
        log_error "Failed scans: $failed"
    else
        log "Failed scans: $failed"
    fi
    log "Scan reports location: $OUTPUT_DIR"
    log "=========================================="

    if [[ $failed -gt 0 ]]; then
        exit 1
    fi
}

# Run main function
main "$@"
