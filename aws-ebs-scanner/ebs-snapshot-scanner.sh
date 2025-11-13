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
OUTPUT_DIR="/var/log/thor-scans"
MOUNT_BASE="/mnt"
LOG_FILE="/var/log/ebs-scanner.log"
DRY_RUN=false
MAX_CONCURRENT=1
CLEANUP_ON_ERROR=true

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
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $*${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $*${NC}" | tee -a "$LOG_FILE"
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
  -n, --dry-run                  Show what would be done without executing
  -c, --max-concurrent <num>     Maximum concurrent scans (default: 1)
  --no-cleanup-on-error          Don't cleanup resources if scan fails
  -h, --help                     Show this help message

Examples:
  # Scan all snapshots in us-east-1
  $0 -r us-east-1

  # Scan snapshots from the last 30 days
  $0 -r us-east-1 -d 30

  # Scan specific snapshots
  $0 -r us-east-1 -s snap-12345678,snap-87654321

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if running as root
    if [[ $EUID -ne 0 ]] && [[ "$DRY_RUN" == false ]]; then
        log_error "This script must be run as root for mounting operations"
        exit 1
    fi

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi

    # Check Thor scanner
    if [[ ! -f "$THOR_PATH" ]] && [[ "$DRY_RUN" == false ]]; then
        log_error "Thor scanner not found at: $THOR_PATH"
        log_error "Please install Thor or specify correct path with -t option"
        exit 1
    fi

    # Verify AWS credentials
    if ! aws sts get-caller-identity --region "$REGION" &> /dev/null; then
        log_error "AWS credentials not configured or invalid"
        exit 1
    fi

    # Get instance ID and availability zone
    INSTANCE_ID=$(ec2-metadata --instance-id 2>/dev/null | cut -d ' ' -f 2 || curl -s http://169.254.169.254/latest/meta-data/instance-id)
    AVAILABILITY_ZONE=$(ec2-metadata --availability-zone 2>/dev/null | cut -d ' ' -f 2 || curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)

    if [[ -z "$INSTANCE_ID" ]]; then
        log_error "Could not determine EC2 instance ID. Are you running on an EC2 instance?"
        exit 1
    fi

    log "Instance ID: $INSTANCE_ID"
    log "Availability Zone: $AVAILABILITY_ZONE"

    # Create output directory
    mkdir -p "$OUTPUT_DIR"

    log_success "All prerequisites met"
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

    local volume_id=$(aws ec2 create-volume \
        --region "$REGION" \
        --availability-zone "$AVAILABILITY_ZONE" \
        --snapshot-id "$snapshot_id" \
        --volume-type gp3 \
        --tag-specifications "ResourceType=volume,Tags=[{Key=Name,Value=thor-scan-temp},{Key=SnapshotId,Value=$snapshot_id},{Key=CreatedBy,Value=ebs-scanner}]" \
        --query 'VolumeId' \
        --output text)

    if [[ -z "$volume_id" ]]; then
        log_error "Failed to create volume from snapshot: $snapshot_id"
        return 1
    fi

    log "Created volume: $volume_id"

    # Wait for volume to be available
    log "Waiting for volume to become available..."
    aws ec2 wait volume-available --region "$REGION" --volume-ids "$volume_id"

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

    aws ec2 attach-volume \
        --region "$REGION" \
        --volume-id "$volume_id" \
        --instance-id "$INSTANCE_ID" \
        --device "$device" > /dev/null

    # Wait for volume to be attached
    log "Waiting for volume to attach..."
    aws ec2 wait volume-in-use --region "$REGION" --volume-ids "$volume_id"

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
    local thor_cmd="$THOR_PATH \
        --lab \
        -p \"$mount_point\" \
        --htmlfile \"$output_file\" \
        --logfile \"$log_file\" \
        --allreasons \
        --intense \
        --fsonly"

    log "Executing: $thor_cmd"

    # Run Thor scanner
    if eval "$thor_cmd"; then
        log_success "Thor scan completed successfully"
        log "Scan report: $output_file"
        log "Scan log: $log_file"
        return 0
    else
        local exit_code=$?
        log_warning "Thor scan completed with exit code: $exit_code"
        log "This may indicate findings were detected (consult Thor documentation)"
        log "Scan report: $output_file"
        log "Scan log: $log_file"
        return 0  # Don't fail on Thor findings
    fi
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
    if aws ec2 describe-volumes --region "$REGION" --volume-ids "$volume_id" --query 'Volumes[0].State' --output text 2>/dev/null | grep -q "in-use"; then
        log "Detaching volume $volume_id"
        aws ec2 detach-volume --region "$REGION" --volume-id "$volume_id" > /dev/null || log_warning "Failed to detach volume"

        # Wait for volume to detach
        log "Waiting for volume to detach..."
        aws ec2 wait volume-available --region "$REGION" --volume-ids "$volume_id" 2>/dev/null || true
    fi

    # Delete volume
    log "Deleting volume $volume_id"
    aws ec2 delete-volume --region "$REGION" --volume-id "$volume_id" || log_warning "Failed to delete volume"

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

    # Get available device
    device=$(get_available_device)
    if [[ $? -ne 0 ]] || [[ -z "$device" ]]; then
        log_error "No available device for snapshot: $snapshot_id"
        cleanup_volume "$volume_id" "" ""
        return 1
    fi

    # Attach volume
    if ! attach_volume "$volume_id" "$device"; then
        log_error "Failed to attach volume: $volume_id"
        cleanup_volume "$volume_id" "" ""
        return 1
    fi

    # Mount volume
    if ! mount_volume "$device" "$mount_point"; then
        log_error "Failed to mount volume: $volume_id"
        cleanup_volume "$volume_id" "$device" "$mount_point"
        return 1
    fi

    # Scan with Thor
    local scan_result=0
    if ! scan_with_thor "$mount_point" "$snapshot_id" "$scan_uuid"; then
        log_error "Thor scan failed for snapshot: $snapshot_id"
        scan_result=1
    fi

    # Cleanup
    cleanup_volume "$volume_id" "$device" "$mount_point"

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
