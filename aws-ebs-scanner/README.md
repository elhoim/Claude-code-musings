# AWS EBS Snapshot Scanner with Nextron Thor

Automated bash script for scanning EBS snapshots using Nextron Thor forensic scanner.

## Features

- **Automated EBS Snapshot Discovery**: Lists all EBS snapshots in a specified AWS region
- **Date Filtering**: Optional filtering for snapshots more recent than X days
- **Volume Management**: Automatically creates volumes from snapshots, attaches, and mounts them
- **Read-Only Mounting**: Mounts volumes in read-only mode under unique UUID directories in `/mnt/`
- **Thor Integration**: Scans mounted volumes using Nextron Thor scanner in forensic lab mode
- **Custom Thor Flags**: Pass additional Thor scanner flags for customized scanning behavior
- **Automatic Cleanup**: Unmounts, detaches, and deletes temporary volumes (preserves original snapshots)
- **Comprehensive Logging**: Detailed logging of all operations with debug mode support
- **Robust Error Handling**:
  - Automatic retry logic for AWS API calls with exponential backoff
  - Emergency cleanup on script interruption (Ctrl+C) or errors
  - Trap handlers ensure resources are always cleaned up
  - Global state tracking for proper resource management

## Prerequisites

### System Requirements

1. **EC2 Instance**: Must run on an EC2 instance in the target AWS region
2. **Root Access**: Requires root/sudo privileges for mounting operations
3. **AWS CLI**: Version 1.x or 2.x installed and configured
4. **System Utilities**: `mountpoint`, `blkid`, `uuidgen` (usually pre-installed on Linux)

### AWS Requirements

1. **AWS Credentials**: Configured via IAM role (recommended) or AWS credentials file
2. **IAM Permissions**: The following EC2 permissions are required and will be validated at startup:

3. **Nextron Thor Scanner**:
   - Thor scanner installed (default path: `/opt/nextron/thor/thor64`)
   - Thor binary must be executable (`chmod +x`)
   - Valid Thor Forensic Lab license

### Automated Prerequisite Checks

The script automatically validates all prerequisites at startup:

- ✓ **Root Access**: Verifies script is run with sudo/root
- ✓ **AWS CLI**: Checks installation and version
- ✓ **AWS Credentials**: Validates credentials are configured
- ✓ **EC2 Metadata**: Confirms running on EC2 instance
- ✓ **IAM Permissions**: Tests all required EC2 permissions using AWS dry-run API
- ✓ **Thor Scanner**: Verifies Thor binary exists and is executable
- ✓ **System Utilities**: Checks for required utilities (mountpoint, blkid, uuidgen)
- ✓ **Output Directory**: Validates write access to output directory

If any check fails, the script will exit with a clear error message indicating what needs to be fixed.

## Installation

1. Clone or download the script:
```bash
git clone <repository-url>
cd aws-ebs-scanner
```

2. Ensure the script is executable:
```bash
chmod +x ebs-snapshot-scanner.sh
```

3. Install Nextron Thor scanner if not already installed

## Usage

### Basic Usage

Scan all snapshots in a region:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1
```

### Filter by Date

Scan only snapshots from the last 30 days:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -d 30
```

### Scan Specific Snapshots

Scan specific snapshot IDs:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -s snap-12345678,snap-87654321
```

### Custom Thor Path

Specify a custom Thor binary path:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -t /custom/path/to/thor64
```

### Custom Output Directory

Specify where Thor scan reports should be saved:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -o /custom/output/dir
```

### Dry Run

Preview what would be scanned without executing:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -d 7 -n
```

## Command Line Options

| Option | Description | Required |
|--------|-------------|----------|
| `-r, --region <region>` | AWS region (e.g., us-east-1) | Yes |
| `-d, --days <days>` | Filter snapshots more recent than X days | No |
| `-t, --thor-path <path>` | Path to Thor binary | No (default: `/opt/nextron/thor/thor64`) |
| `-o, --output-dir <path>` | Thor scan output directory | No (default: `/var/log/thor-scans`) |
| `-s, --snapshot-ids <ids>` | Comma-separated snapshot IDs to scan | No |
| `-f, --thor-flags <flags>` | Additional flags to pass to Thor scanner (quoted string) | No |
| `-n, --dry-run` | Show what would be done without executing | No |
| `-c, --max-concurrent <num>` | Maximum concurrent scans | No (default: 1) |
| `--no-cleanup-on-error` | Don't cleanup resources if scan fails | No |
| `--debug` | Enable debug logging | No |
| `-h, --help` | Show help message | No |

## How It Works

1. **Snapshot Discovery**: Queries AWS for EBS snapshots matching the specified criteria
2. **Volume Creation**: Creates a new EBS volume from each snapshot
3. **Volume Attachment**: Attaches the volume to the running EC2 instance
4. **Mounting**: Mounts the volume read-only under `/mnt/ebs-scan-{uuid}`
5. **Scanning**: Runs Thor scanner in forensic lab mode on the mounted volume
6. **Cleanup**:
   - Unmounts the volume
   - Detaches the volume from the instance
   - Deletes the temporary volume
   - **Preserves the original snapshot**
7. **Reporting**: Generates Thor scan reports in the output directory

## Output

### Scan Reports

Thor scan reports are saved to the output directory (default: `/var/log/thor-scans/`) with the following naming convention:
- HTML Report: `thor-scan-{snapshot-id}-{uuid}.html`
- Log File: `thor-scan-{snapshot-id}-{uuid}.log`

### Script Logs

The script's operational log is saved to: `/var/log/ebs-scanner.log`

## IAM Permissions Required

The script requires the following IAM permissions, which are automatically validated at startup using AWS dry-run operations:

| Permission | Purpose | Validated |
|------------|---------|-----------|
| `ec2:DescribeSnapshots` | List EBS snapshots | ✓ Yes |
| `ec2:DescribeVolumes` | Query volume status | ✓ Yes |
| `ec2:CreateVolume` | Create volumes from snapshots | ✓ Yes (dry-run) |
| `ec2:AttachVolume` | Attach volumes to EC2 instance | ✓ Yes (dry-run) |
| `ec2:DetachVolume` | Detach volumes from instance | ✓ Yes (dry-run) |
| `ec2:DeleteVolume` | Delete temporary volumes | ✓ Yes (dry-run) |
| `ec2:CreateTags` | Tag created volumes | ✓ Yes (dry-run) |

### IAM Policy Example

Attach this policy to your EC2 instance IAM role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EBSSnapshotScanner",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeSnapshots",
        "ec2:DescribeVolumes",
        "ec2:CreateVolume",
        "ec2:AttachVolume",
        "ec2:DetachVolume",
        "ec2:DeleteVolume",
        "ec2:CreateTags"
      ],
      "Resource": "*"
    }
  ]
}
```

### Permission Validation

The script validates all permissions at startup using AWS dry-run operations. If any permission is missing, you'll see output like:

```
[2025-01-XX XX:XX:XX] Checking IAM permissions...
[2025-01-XX XX:XX:XX] AWS Account: 123456789012
[2025-01-XX XX:XX:XX] IAM Identity: arn:aws:sts::123456789012:assumed-role/MyRole/i-1234567890abcdef0
[2025-01-XX XX:XX:XX] SUCCESS: ✓ ec2:DescribeSnapshots
[2025-01-XX XX:XX:XX] SUCCESS: ✓ ec2:DescribeVolumes
[2025-01-XX XX:XX:XX] ERROR: ✗ ec2:CreateVolume - Permission denied
...
```

This validation ensures you discover permission issues immediately, before any resources are created.

## Error Handling & Recovery

The script includes comprehensive error handling:

### Automatic Retry Logic
- AWS API calls automatically retry up to 3 times with exponential backoff (5s, 10s, 20s)
- Handles transient AWS service failures gracefully

### Emergency Cleanup
- Trap handlers catch script interruptions (Ctrl+C, errors, unexpected exits)
- Automatically cleans up any allocated resources:
  - Force unmounts volumes (using `-f` or `-l` flags if needed)
  - Detaches volumes from the instance with `--force` flag
  - Deletes temporary volumes to prevent AWS charges
- Global state tracking ensures cleanup happens even on unexpected failures

### Safe Exit
The script will properly clean up resources in these scenarios:
- User interruption (Ctrl+C)
- Script errors or crashes
- AWS API failures
- Mount or Thor scanner failures

## Security Considerations

- Volumes are mounted with `ro,noexec,nodev,nosuid` flags for security
- Script requires root access for mounting operations
- Temporary volumes are automatically cleaned up after scanning
- Original snapshots are never modified or deleted
- All operations are logged for audit purposes
- Emergency cleanup prevents resource leaks on failure

## Troubleshooting

### Prerequisites Issues

#### "AWS CLI is not installed"
**Solution**: Install AWS CLI v1 or v2
```bash
# AWS CLI v2 (recommended)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### "AWS credentials not configured or invalid"
**Solutions**:
- Use IAM role (recommended for EC2): Attach an IAM role with required permissions to the instance
- Configure credentials: `aws configure`
- Check existing credentials: `aws sts get-caller-identity`

#### "Permission denied" for IAM actions
**Solution**: The startup checks will show exactly which permissions are missing. Add the missing permissions to your IAM role/user policy:
```bash
# Example error output:
[ERROR] ✗ ec2:CreateVolume - Permission denied
[ERROR] ✗ ec2:AttachVolume - Permission denied

# Fix: Add these permissions to your IAM policy (see IAM Policy Example above)
```

#### "Could not determine EC2 instance ID"
**Solutions**:
- Ensure you're running on an EC2 instance
- Check instance metadata service: `curl http://169.254.169.254/latest/meta-data/instance-id`
- For IMDSv2, ensure the script can access metadata service

#### "Thor scanner not found"
**Solutions**:
- Verify Thor installation: `ls -l /opt/nextron/thor/thor64`
- Use `-t` option to specify custom path: `-t /custom/path/to/thor`
- Download Thor from: https://www.nextron-systems.com/thor/

#### "Thor scanner is not executable"
**Solution**: Make Thor executable
```bash
chmod +x /opt/nextron/thor/thor64
```

### Runtime Issues

#### "No available device names"
**Solutions**:
- Too many volumes already attached to the instance
- Check attached volumes: `lsblk` or `aws ec2 describe-volumes --filters Name=attachment.instance-id,Values=$(ec2-metadata --instance-id | cut -d' ' -f2)`
- Detach unused volumes
- Consider using a larger instance type with more device slots

#### "Failed to mount volume"
**Solutions**:
- The volume may contain an unsupported filesystem
- Check the logs for specific mount errors: `tail -f /var/log/ebs-scanner.log`
- Verify the snapshot contains a valid filesystem
- Try mounting manually to diagnose: `mount -o ro /dev/xvdf1 /mnt/test`

#### "Volume did not become available in time"
**Solutions**:
- AWS API may be experiencing delays
- Check AWS service health: https://status.aws.amazon.com/
- The script will automatically retry with exponential backoff
- Large volumes take longer to create

### Debug Mode

Enable debug mode for detailed troubleshooting:
```bash
sudo ./ebs-snapshot-scanner.sh -r us-east-1 --debug
```

This will show:
- Detailed AWS API call attempts
- Thor scanner command being executed
- Step-by-step operation logs

## Thor Scanner Configuration

The script uses Thor in forensic lab mode with the following default options:

```bash
$THOR_PATH \
    --lab \
    -p "$mount_point" \
    --htmlfile "$output_file" \
    --logfile "$log_file" \
    --allreasons \
    --intense \
    --fsonly
```

Adjust these options in the `scan_with_thor()` function based on your Thor license and requirements.

For more information on Thor forensic lab mode, see: https://thor-manual.nextron-systems.com/

## Examples

### Example 1: Scan Recent Development Snapshots
```bash
sudo ./ebs-snapshot-scanner.sh -r us-west-2 -d 7 -o /mnt/forensics/dev-scans
```

### Example 2: Scan Specific Production Snapshots
```bash
sudo ./ebs-snapshot-scanner.sh \
    -r eu-west-1 \
    -s snap-prod001,snap-prod002,snap-prod003 \
    -o /mnt/forensics/prod-scans
```

### Example 3: Dry Run Before Full Scan
```bash
# First, see what would be scanned
sudo ./ebs-snapshot-scanner.sh -r ap-southeast-1 -d 30 -n

# Then run the actual scan
sudo ./ebs-snapshot-scanner.sh -r ap-southeast-1 -d 30
```

### Example 4: Custom Thor Scanning Flags
```bash
# Quick scan with custom flags
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -f "--quick --norescontrol"

# Deep scan with multiple custom flags
sudo ./ebs-snapshot-scanner.sh -r eu-west-1 -d 7 -f "--intense --lookback --norescontrol"
```

### Example 5: Debug Mode for Troubleshooting
```bash
# Enable debug logging to troubleshoot issues
sudo ./ebs-snapshot-scanner.sh -r us-east-1 -d 30 --debug
```

## License

This script is provided as-is for use with properly licensed Nextron Thor scanner installations.

## Support

For issues or questions:
- Script issues: Check logs at `/var/log/ebs-scanner.log`
- Thor scanner issues: Consult Thor documentation
- AWS issues: Check IAM permissions and instance metadata
