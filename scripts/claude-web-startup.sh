#!/usr/bin/env bash
#
# Startup script for Claude Code on the web sessions.
#
# Point your environment's startup/setup script at this file, e.g.:
#   bash scripts/claude-web-startup.sh
#
# It is idempotent and safe to run repeatedly. It:
#   1. Starts a Docker daemon (needed by the testcontainers-based integration
#      tests in libs/c4-model) if one isn't already running.
#   2. Pre-pulls the container images those tests use (best-effort).
#   3. Installs workspace dependencies with pnpm.
#
set -uo pipefail

log() { echo "[web-startup] $*"; }

# 1. Ensure a Docker daemon is running (best-effort).
ensure_docker() {
    if docker info >/dev/null 2>&1; then
        log "Docker daemon already running."
        return 0
    fi
    if ! command -v dockerd >/dev/null 2>&1; then
        log "dockerd not installed; skipping Docker startup."
        return 1
    fi
    log "Starting Docker daemon..."
    local sudo=""
    [ "$(id -u)" -ne 0 ] && sudo="sudo -n"
    $sudo dockerd >/tmp/dockerd.log 2>&1 &
    for _ in $(seq 1 30); do
        if docker info >/dev/null 2>&1; then
            log "Docker daemon is up."
            return 0
        fi
        sleep 1
    done
    log "WARNING: Docker daemon did not start within 30s (see /tmp/dockerd.log)."
    return 1
}
ensure_docker || true

# 2. Pre-pull the images used by the c4-model integration tests (best-effort).
if docker info >/dev/null 2>&1; then
    for img in \
        structurizr/structurizr:2026.05.16 \
        structurizr/structurizr:2026.05.16-playwright \
        minlag/mermaid-cli:11.15.0; do
        log "Pulling $img ..."
        docker pull "$img" >/dev/null 2>&1 || log "WARNING: failed to pull $img"
    done
fi

# 3. Install workspace dependencies (authoritative — its exit code is the script's).
log "Installing dependencies with pnpm..."
corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile
status=$?

log "Startup complete (pnpm install exit=$status)."
exit $status
