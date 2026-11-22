#!/usr/bin/env bash
# =============================================================================
# VERITAS OSINT - one-shot host installer (GCP e2-micro OR friend's mini PC)
# Tested target: Debian 12 / Ubuntu 22.04+ (x86_64 or arm64)
#
# Usage (run ON the host, from the unpacked project folder):
#   sudo bash deploy/install-host.sh --name veritas-gcp            # GCP VM
#   sudo bash deploy/install-host.sh --name veritas-minipc --port 8090   # mini PC
# Optional:  --funnel   publish publicly (https://<name>.<tailnet>.ts.net)
#            --authkey tskey-auth-xxxx   join Tailscale without a browser login
#            --skip-tailscale            host already has Tailscale (mini PC)
# Safe to re-run: every step is idempotent. Re-running = redeploy.
# =============================================================================
set -euo pipefail

NAME="veritas"; PORT="8080"; FUNNEL=0; AUTHKEY=""; SKIP_TS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --funnel) FUNNEL=1; shift;;
    --authkey) AUTHKEY="$2"; shift 2;;
    --skip-tailscale) SKIP_TS=1; shift;;
    *) echo "Unknown option $1"; exit 1;;
  esac
done

[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="/opt/veritas"
log() { echo -e "\n\033[1;36m[veritas]\033[0m $*"; }

# --- 1. Swap: lets the 1 GB VM build images and survive spikes --------------
TOTAL_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [[ $TOTAL_MB -lt 3000 ]] && ! swapon --show | grep -q /swapfile; then
  log "Adding 2 GB swap (RAM is ${TOTAL_MB} MB)"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10 >/dev/null; echo 'vm.swappiness=10' > /etc/sysctl.d/99-veritas.conf
fi

# --- 2. Base packages + automatic security updates (no auto-reboot) ---------
log "Installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates unattended-upgrades >/dev/null
dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null || true

# --- 3. Docker (official convenience script), enabled at boot ----------------
if ! command -v docker >/dev/null; then
  log "Installing Docker"
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# --- 4. Tailscale: private HTTPS for Harsh's iPad / phone / laptop -----------
if [[ $SKIP_TS -eq 0 ]]; then
  command -v tailscale >/dev/null || { log "Installing Tailscale"; curl -fsSL https://tailscale.com/install.sh | sh; }
  systemctl enable --now tailscaled
  if ! tailscale status >/dev/null 2>&1; then
    log "Joining tailnet as '$NAME' (open the printed URL and log in as Harsh if asked)"
    if [[ -n "$AUTHKEY" ]]; then tailscale up --ssh --hostname="$NAME" --authkey="$AUTHKEY"
    else tailscale up --ssh --hostname="$NAME"; fi
  fi
fi

# --- 5. Copy app to /opt/veritas and start the stack -------------------------
log "Deploying app to $APP_DIR"
mkdir -p "$APP_DIR"
if [[ "$SRC_DIR" != "$APP_DIR" ]]; then
  tar -C "$SRC_DIR" --exclude=node_modules --exclude=dist --exclude=.git -cf - . | tar -C "$APP_DIR" -xf -
fi
echo "VERITAS_PORT=$PORT" > "$APP_DIR/deploy/.env"
cd "$APP_DIR"
docker compose --env-file deploy/.env -f deploy/docker-compose.free.yml up -d --build --remove-orphans
docker image prune -f >/dev/null

# --- 6. systemd: start on boot + health watchdog every 2 minutes -------------
log "Installing systemd service + watchdog"
install -m 755 deploy/watchdog.sh /usr/local/bin/veritas-watchdog
cat > /etc/systemd/system/veritas.service <<EOF
[Unit]
Description=VERITAS OSINT stack
Requires=docker.service
After=docker.service network-online.target
[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose --env-file deploy/.env -f deploy/docker-compose.free.yml up -d
ExecStop=/usr/bin/docker compose --env-file deploy/.env -f deploy/docker-compose.free.yml down
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/veritas-watchdog.service <<EOF
[Unit]
Description=VERITAS health watchdog
[Service]
Type=oneshot
Environment=VERITAS_PORT=$PORT
ExecStart=/usr/local/bin/veritas-watchdog
EOF
cat > /etc/systemd/system/veritas-watchdog.timer <<EOF
[Unit]
Description=Run VERITAS watchdog every 2 minutes
[Timer]
OnBootSec=3min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable veritas.service veritas-watchdog.timer >/dev/null
systemctl start veritas-watchdog.timer

# --- 7. Publish over HTTPS via Tailscale ------------------------------------
if command -v tailscale >/dev/null && tailscale status >/dev/null 2>&1; then
  if [[ $FUNNEL -eq 1 ]]; then
    log "Publishing PUBLIC https URL (Tailscale Funnel)"
    tailscale funnel --bg "$PORT" || echo "Funnel failed: enable HTTPS + Funnel in the Tailscale admin console, then re-run."
  else
    log "Publishing PRIVATE https URL (Tailscale Serve, tailnet devices only)"
    tailscale serve --bg "$PORT" || echo "Serve failed: enable HTTPS certificates in the Tailscale admin console, then re-run."
  fi
  # "Self" appears before "Peer" in the JSON, so the first DNSName is this host
  DNS=$(tailscale status --json 2>/dev/null | sed -n 's/.*"DNSName": *"\([^"]*\)\.".*/\1/p' | head -1)
  log "DONE. Open on any of Harsh's devices:  https://${DNS:-$NAME.<your-tailnet>.ts.net}"
fi

sleep 5
curl -fsS "http://127.0.0.1:$PORT/healthz" && log "Health check OK on port $PORT" || log "WARNING: health check failed - run: docker compose -f $APP_DIR/deploy/docker-compose.free.yml logs"
