# AWS EBS Snapshot Scanner with Nextron Thor

Automated bash script for scanning EBS snapshots using Nextron Thor forensic scanner.

## Features

- **Automated EBS Snapshot Discovery**: Lists all EBS snapshots in a specified AWS region
- **Date Filtering**: Optional filtering for snapshots more recent than X days
- **Volume Management**: Automatically creates volumes from snapshots, attaches, and mounts them
- **Read-Only Mounting**: Mounts volumes in read-only mode under unique UUID directories in `/mnt/`
- **Thor Integration**: Scans mounted volumes using Nextron Thor scanner in forensic lab mode
- **Automatic Cleanup**: Unmounts, detaches, and deletes temporary volumes (preserves original snapshots)
- **Comprehensive Logging**: Detailed logging of all operations
- **Error Handling**: Robust error handling with optional cleanup on failure

## Prerequisites

1. **AWS Environment**:
   - Running on an EC2 instance in the target region
   - AWS CLI installed and configured
   - IAM permissions for EC2 operations (describe-snapshots, create-volume, attach-volume, etc.)

2. **Nextron Thor Scanner**:
   - Thor scanner installed (default path: `/opt/nextron/thor/thor64`)
   - Valid Thor Forensic Lab license

3. **System Requirements**:
   - Root/sudo access
   - Available block device names (xvdf-xvdp)
   - Sufficient disk space in `/mnt/` for mounting volumes

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
| `-n, --dry-run` | Show what would be done without executing | No |
| `-c, --max-concurrent <num>` | Maximum concurrent scans | No (default: 1) |
| `--no-cleanup-on-error` | Don't cleanup resources if scan fails | No |
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

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
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

## Security Considerations

- Volumes are mounted with `ro,noexec,nodev,nosuid` flags for security
- Script requires root access for mounting operations
- Temporary volumes are automatically cleaned up after scanning
- Original snapshots are never modified or deleted
- All operations are logged for audit purposes

## Troubleshooting

### "Could not determine EC2 instance ID"
- Ensure you're running on an EC2 instance
- Check that instance metadata service is accessible

### "No available device names"
- Too many volumes already attached to the instance
- Detach unused volumes or increase MAX_CONCURRENT limit carefully

### "Failed to mount volume"
- The volume may contain an unsupported filesystem
- Check the logs for specific mount errors
- Verify the snapshot contains a valid filesystem

### "Thor scanner not found"
- Verify Thor installation path
- Use `-t` option to specify custom path

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

## License

This script is provided as-is for use with properly licensed Nextron Thor scanner installations.

## Support

For issues or questions:
- Script issues: Check logs at `/var/log/ebs-scanner.log`
- Thor scanner issues: Consult Thor documentation
- AWS issues: Check IAM permissions and instance metadata
