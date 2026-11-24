<#
.SYNOPSIS
  One-command deployment script for VERITAS OSINT on minipc1 (Tailscale + systemd --user).
.DESCRIPTION
  Runs pre-deploy tests (unless -SkipTests), optionally pushes local commits (-Push),
  syncs ~/ai-news-feed on minipc1 to origin/main, rebuilds the Vite production bundle,
  restarts veritas-web.service (:8090) and veritas-api.service (:8081), and verifies health probes.
.EXAMPLE
  .\deploy\deploy-minipc1.ps1
  .\deploy\deploy-minipc1.ps1 -Push
  .\deploy\deploy-minipc1.ps1 -SkipTests -InstallDeps
#>
param(
  [string]$SshHost = "minipc",
  [string]$TailscaleIp = "100.72.160.38",
  [string]$Branch = "main",
  [int]$WebPort = 8090,
  [int]$ApiPort = 8081,
  [switch]$Push,
  [switch]$InstallDeps,
  [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

try {
  Write-Host "==============================================================================" -ForegroundColor Cyan
  Write-Host "  VERITAS OSINT -> minipc1 Deployment ($SshHost / $TailscaleIp)" -ForegroundColor Cyan
  Write-Host "==============================================================================" -ForegroundColor Cyan

  if (-not $SkipTests) {
    Write-Host "`n[1/4] Running pre-deploy test suite..." -ForegroundColor Yellow
    npm test
    if ($LASTEXITCODE -ne 0) { throw "Pre-deploy tests failed. Aborting deployment." }
  } else {
    Write-Host "`n[1/4] Skipping pre-deploy tests (-SkipTests)." -ForegroundColor DarkGray
  }

  if ($Push) {
    Write-Host "`n[2/4] Pushing branch '$Branch' to origin..." -ForegroundColor Yellow
    git push origin $Branch
    if ($LASTEXITCODE -ne 0) { throw "git push failed." }
  } else {
    Write-Host "`n[2/4] Skipping git push (use -Push to push local commits first)." -ForegroundColor DarkGray
  }

  Write-Host "`n[3/4] Syncing, building, and restarting systemd services on $SshHost..." -ForegroundColor Yellow

  $installCmd = if ($InstallDeps) { "npm ci --no-audit --no-fund && " } else { "" }

  $remoteScript = @"
set -euo pipefail
export PATH="/home/hega/.nvm/versions/node/v26.13.1/bin:`$PATH"

cd ~/ai-news-feed
git fetch origin
git reset --hard origin/$Branch

${installCmd}npm run build

mkdir -p ~/.config/systemd/user

cat << 'UNIT' > ~/.config/systemd/user/veritas-web.service
[Unit]
Description=VERITAS OSINT Unified Web HUD & API Gateway (Port $WebPort)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/hega/ai-news-feed
Environment=NODE_ENV=production
Environment=PORT=$WebPort
ExecStart=/home/hega/.nvm/versions/node/v26.13.1/bin/node /home/hega/ai-news-feed/src/server/apiServer.js
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
UNIT

cat << 'UNIT' > ~/.config/systemd/user/veritas-api.service
[Unit]
Description=VERITAS OSINT Core Backend API Gateway (Port $ApiPort)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/hega/ai-news-feed
Environment=NODE_ENV=production
Environment=PORT=$ApiPort
ExecStart=/home/hega/.nvm/versions/node/v26.13.1/bin/node /home/hega/ai-news-feed/src/server/apiServer.js
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
UNIT

systemctl --user daemon-reload
systemctl --user enable veritas-web.service veritas-api.service >/dev/null 2>&1 || true
systemctl --user restart veritas-web.service veritas-api.service
sleep 2
systemctl --user is-active veritas-web.service veritas-api.service
"@

  # Strip all CR characters for Linux bash / systemd compatibility
  $remoteScriptUnix = $remoteScript -replace "`r", ""
  $remoteScriptUnix | ssh -o BatchMode=yes $SshHost "tr -d '\r' | bash -s"
  if ($LASTEXITCODE -ne 0) { throw "Remote deployment command failed on $SshHost." }

  Write-Host "`n[4/4] Verifying live endpoints over Tailscale..." -ForegroundColor Yellow
  $webHealth = (Invoke-WebRequest -Uri "http://${TailscaleIp}:${WebPort}/healthz" -UseBasicParsing -TimeoutSec 10).StatusCode
  $apiReady  = (Invoke-WebRequest -Uri "http://${TailscaleIp}:${ApiPort}/readyz" -UseBasicParsing -TimeoutSec 10).StatusCode
  $hudStatus = (Invoke-WebRequest -Uri "http://${TailscaleIp}:${WebPort}/" -UseBasicParsing -TimeoutSec 10).StatusCode

  if ($webHealth -eq 200 -and $apiReady -eq 200 -and $hudStatus -eq 200) {
    Write-Host "`n[OK] Deployment verified!" -ForegroundColor Green
    Write-Host "  - Web HUD + API : http://minipc1.tailfe6620.ts.net:$WebPort (http://${TailscaleIp}:$WebPort)" -ForegroundColor Cyan
    Write-Host "  - Backend API   : http://minipc1.tailfe6620.ts.net:$ApiPort/readyz" -ForegroundColor Cyan
  } else {
    throw "Health verification returned unexpected status codes (web=$webHealth, api=$apiReady, hud=$hudStatus)."
  }
} finally {
  Pop-Location
}
