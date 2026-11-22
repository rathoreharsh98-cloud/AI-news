#!/usr/bin/env bash
# VERITAS watchdog - runs every 2 min via systemd timer.
# 1) Docker daemon dead -> restart it.  2) Site unhealthy 3x in a row -> restart stack.
# 3) Disk > 90% -> prune old images/logs.  Logs to journal: journalctl -u veritas-watchdog
PORT="${VERITAS_PORT:-8080}"
STATE=/var/tmp/veritas-watchdog.fail
COMPOSE="docker compose --env-file /opt/veritas/deploy/.env -f /opt/veritas/deploy/docker-compose.free.yml"

if ! systemctl is-active --quiet docker; then
  echo "docker down -> restarting"; systemctl restart docker; sleep 15
fi

if curl -fsS --max-time 5 "http://127.0.0.1:${PORT}/healthz" >/dev/null; then
  rm -f "$STATE"
else
  n=$(( $(cat "$STATE" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$STATE"
  echo "health check failed ($n/3)"
  if [[ $n -ge 3 ]]; then
    echo "restarting VERITAS stack"; cd /opt/veritas && $COMPOSE up -d --force-recreate; rm -f "$STATE"
  fi
fi

USED=$(df --output=pcent / | tail -1 | tr -dc '0-9')
if [[ ${USED:-0} -ge 90 ]]; then
  echo "disk ${USED}% -> pruning"; docker system prune -af >/dev/null; journalctl --vacuum-size=100M >/dev/null
fi
