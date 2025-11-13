<#
.SYNOPSIS
    Lists all IIS logging directories from applicationHost.config files found on the system.

.DESCRIPTION
    This script searches for all applicationHost.config files on the system,
    parses them to extract site names and their logging directories,
    and outputs the results in CSV format.

.PARAMETER OutputPath
    Optional path to save the CSV output. If not specified, outputs to console.

.EXAMPLE
    .\Get-IISLoggingDirectories.ps1

.EXAMPLE
    .\Get-IISLoggingDirectories.ps1 -OutputPath "C:\Reports\IIS-Logging.csv"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath
)

# Get the hostname
$hostname = $env:COMPUTERNAME

# Initialize results array
$results = @()

Write-Verbose "Searching for applicationHost.config files..."

# Common locations to search for applicationHost.config
$searchPaths = @(
    "$env:SystemRoot\System32\inetsrv\config",
    "$env:SystemRoot\SysWOW64\inetsrv\config",
    "C:\inetpub",
    "$env:ProgramFiles\IIS Express\config"
)

# Search for all applicationHost.config files
$configFiles = @()

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        Write-Verbose "Searching in: $path"
        $foundFiles = Get-ChildItem -Path $path -Filter "applicationHost.config" -Recurse -ErrorAction SilentlyContinue
        $configFiles += $foundFiles
    }
}

# Also perform a broader search on all fixed drives (can be slow, but comprehensive)
Write-Verbose "Performing comprehensive search on all fixed drives..."
$drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match '^[A-Z]:\\$' }

foreach ($drive in $drives) {
    try {
        $foundFiles = Get-ChildItem -Path $drive.Root -Filter "applicationHost.config" -Recurse -ErrorAction SilentlyContinue
        $configFiles += $foundFiles
    }
    catch {
        Write-Verbose "Unable to search drive $($drive.Root): $_"
    }
}

# Remove duplicates
$configFiles = $configFiles | Select-Object -Unique -Property FullName

if ($configFiles.Count -eq 0) {
    Write-Warning "No applicationHost.config files found on this system."

    # Return empty CSV with headers
    $emptyResult = [PSCustomObject]@{
        Hostname = $hostname
        ConfigPath = "N/A"
        SiteName = "N/A"
        LogDirectory = "N/A"
    }

    if ($OutputPath) {
        $emptyResult | Export-Csv -Path $OutputPath -NoTypeInformation
        Write-Host "Empty report saved to: $OutputPath"
    }
    else {
        $emptyResult | ConvertTo-Csv -NoTypeInformation | Write-Output
    }

    return
}

Write-Verbose "Found $($configFiles.Count) applicationHost.config file(s)"

# Parse each config file
foreach ($configFile in $configFiles) {
    Write-Verbose "Processing: $($configFile.FullName)"

    try {
        # Load the XML content
        [xml]$config = Get-Content -Path $configFile.FullName -ErrorAction Stop

        # Navigate to the sites section
        $sites = $config.configuration.system.applicationHost.sites.site

        if ($sites) {
            foreach ($site in $sites) {
                # Get site name
                $siteName = $site.name

                # Get log directory
                # The logFile element can be at site level or inherited from siteDefaults
                $logDirectory = $null

                if ($site.logFile -and $site.logFile.directory) {
                    $logDirectory = $site.logFile.directory
                }
                else {
                    # Check siteDefaults
                    $siteDefaults = $config.configuration.system.applicationHost.sites.siteDefaults
                    if ($siteDefaults -and $siteDefaults.logFile -and $siteDefaults.logFile.directory) {
                        $logDirectory = $siteDefaults.logFile.directory
                    }
                }

                # If still null, use IIS default
                if (-not $logDirectory) {
                    $logDirectory = "%SystemDrive%\inetpub\logs\LogFiles"
                }

                # Expand environment variables
                $logDirectory = [System.Environment]::ExpandEnvironmentVariables($logDirectory)

                # Create result object
                $result = [PSCustomObject]@{
                    Hostname = $hostname
                    ConfigPath = $configFile.FullName
                    SiteName = $siteName
                    LogDirectory = $logDirectory
                }

                $results += $result
            }
        }
        else {
            Write-Verbose "No sites found in $($configFile.FullName)"
        }
    }
    catch {
        Write-Warning "Error processing $($configFile.FullName): $_"

        # Add error entry
        $errorResult = [PSCustomObject]@{
            Hostname = $hostname
            ConfigPath = $configFile.FullName
            SiteName = "ERROR"
            LogDirectory = "Failed to parse: $_"
        }

        $results += $errorResult
    }
}

# Output results
if ($results.Count -gt 0) {
    if ($OutputPath) {
        $results | Export-Csv -Path $OutputPath -NoTypeInformation
        Write-Host "Report saved to: $OutputPath"
        Write-Host "Total entries: $($results.Count)"
    }
    else {
        $results | ConvertTo-Csv -NoTypeInformation | Write-Output
    }
}
else {
    Write-Warning "No IIS sites found in any applicationHost.config files."
}
