# ==============================================================================
# VERITAS OSINT - Multi-Stage Enterprise Containerization
# Benchmark: Google SRE Security Standards & CIS Docker Benchmark
# Target Stages:
#   1. builder: Compiles frontend and runs QA verification suites
#   2. frontend (default): Hardened, non-root Nginx runtime for Tactical HUD
#   3. api: Production Node.js non-root runtime for VERITAS Core API Gateway
#   4. telemetry: High-throughput ingestion worker for sensor feeds
#   5. sidecar: Isolated AGPL-3.0 Clean-Room HTTP proxy adapter
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Verify Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install security patches & build dependencies
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci

COPY . .

# Run test pyramid gates prior to compilation
RUN npm test

# Compile production-optimized static artifacts
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Hardened Non-Root Production Frontend (Nginx)
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS frontend

# Security: Remove default Nginx welcome page and configurations
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Configure unprivileged user runtime directories
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp /var/run /var/log/nginx \
    && chown -R 101:101 /var/cache/nginx /var/run /var/log/nginx /etc/nginx

# Non-root unprivileged Nginx configuration on port 8080
RUN printf '%s\n' \
'pid /var/run/nginx.pid;' \
'worker_processes auto;' \
'events { worker_connections 1024; }' \
'http {' \
'    include /etc/nginx/mime.types;' \
'    default_type application/octet-stream;' \
'    sendfile on;' \
'    tcp_nopush on;' \
'    tcp_nodelay on;' \
'    keepalive_timeout 65;' \
'    server_tokens off;' \
'    gzip on;' \
'    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' \
'    server {' \
'        listen 8080 default_server;' \
'        server_name _;' \
'        root /usr/share/nginx/html;' \
'        index index.html;' \
'        # Security Headers (Google SRE Best Practices)' \
'        add_header X-Frame-Options "DENY" always;' \
'        add_header X-Content-Type-Options "nosniff" always;' \
'        add_header X-XSS-Protection "1; mode=block" always;' \
'        add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\''; style-src '\''self'\'' '\''unsafe-inline'\'' https://unpkg.com https://fonts.googleapis.com; font-src '\''self'\'' data: https://fonts.gstatic.com; img-src '\''self'\'' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://*.tile.opentopomap.org https://unpkg.com; connect-src '\''self'\'' https://earthquake.usgs.gov;" always;' \
'        add_header Referrer-Policy "strict-origin-when-cross-origin" always;' \
'        location / {' \
'            try_files $uri $uri/ /index.html;' \
'        }' \
'        # Liveness & Readiness Probe' \
'        location /healthz {' \
'            access_log off;' \
'            default_type text/plain;' \
'            return 200 "healthy\n";' \
'        }' \
'        error_page 500 502 503 504 /50x.html;' \
'        location = /50x.html {' \
'            root /usr/share/nginx/html;' \
'        }' \
'    }' \
'}' > /etc/nginx/nginx.conf

# Copy production bundle from builder stage
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

# Switch to non-root UID 101 (nginx user)
USER 101

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ------------------------------------------------------------------------------
# Stage 3: VERITAS Core API Gateway (Node.js Non-Root)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS api

WORKDIR /app
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY tests/ ./tests/

USER node

EXPOSE 8081

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8081/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/server/apiServer.js"]

# ------------------------------------------------------------------------------
# Stage 4: Streaming Telemetry Ingestion Worker
# ------------------------------------------------------------------------------
FROM node:20-alpine AS telemetry

WORKDIR /app
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

USER node

EXPOSE 8082

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8082/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/server/telemetryIngestion.js"]

# ------------------------------------------------------------------------------
# Stage 5: Clean-Room AGPL-3.0 Sidecar Adapter
# ------------------------------------------------------------------------------
FROM node:20-alpine AS sidecar

WORKDIR /app
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

USER node

EXPOSE 8091

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8091/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/server/worldmonitorAdapter.js"]
