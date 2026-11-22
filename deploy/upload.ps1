# =============================================================================
# VERITAS OSINT - push the app from this Windows laptop to a Linux host and deploy
# Works for BOTH targets because it only needs plain SSH (built into Windows 10/11):
#   GCP VM  : .\deploy\upload.ps1 -Target harsh@veritas-gcp      -Name veritas-gcp
#   Mini PC : .\deploy\upload.ps1 -Target friend@veritas-minipc  -Name veritas-minipc -Port 8090 -SkipTailscale
# (host names resolve via Tailscale MagicDNS once this laptop is on the tailnet;
#  before Tailscale exists on the VM, use its external IP instead)
# =============================================================================
param(
  [Parameter(Mandatory = $true)][string]$Target,   # user@host
  [string]$Name = "veritas",
  [int]$Port = 8080,
  [switch]$Funnel,
  [switch]$SkipTailscale
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$pkg  = Join-Path $PSScriptRoot "veritas-release.tar.gz"

Write-Host "[1/3] Packing project (without node_modules/dist/.git)..." -ForegroundColor Cyan
tar.exe -czf $pkg -C $root --exclude=node_modules --exclude=dist --exclude=.git --exclude=deploy/veritas-release.tar.gz .

Write-Host "[2/3] Uploading to $Target ..." -ForegroundColor Cyan
scp.exe $pkg "${Target}:/tmp/veritas-release.tar.gz"

$flags = "--name $Name --port $Port"
if ($Funnel)        { $flags += " --funnel" }
if ($SkipTailscale) { $flags += " --skip-tailscale" }

Write-Host "[3/3] Installing / redeploying on $Target ..." -ForegroundColor Cyan
ssh.exe -t $Target "rm -rf /tmp/veritas-src && mkdir -p /tmp/veritas-src && tar -xzf /tmp/veritas-release.tar.gz -C /tmp/veritas-src && sudo bash /tmp/veritas-src/deploy/install-host.sh $flags"

Remove-Item $pkg -ErrorAction SilentlyContinue
Write-Host "Done. The site restarts by itself after reboots and crashes." -ForegroundColor Green
