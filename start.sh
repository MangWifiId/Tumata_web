#!/usr/bin/env bash
set -e

# Install Go if missing (apt-get for Debian/Ubuntu based images)
if ! command -v go >/dev/null 2>&1; then
  echo "Go not found – installing Go toolchain…"
  apt-get update -y && apt-get install -y golang-go ca-certificates
fi

# ---------- Backend (Go) ----------
echo "=== Building backend (Go) ==="
cd "$(dirname "$0")/backend"
# Ensure Go modules are tidy
go mod tidy
# Build Linux binary (used by Railpack runtime)
GOOS=linux GOARCH=amd64 go build -o ../dist/tumata-server

echo "Backend built: ../dist/tumata-server"

# ---------- Frontend (React) ----------
echo "=== Building frontend (React) ==="
cd "$(dirname "$0")/frontend"
# Install Node dependencies (pnpm is used in the project)
pnpm install
# Build the React app
pnpm run build

echo "Frontend built: ./dist"

echo "=== Build complete ==="
