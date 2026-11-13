#!/usr/bin/env bash
set -e

# ---------- Backend (Go) ----------
echo "=== Building backend (Go) ==="
cd "$(dirname "$0")/backend"
# Ensure Go modules are tidy
go mod tidy
go build -o ../dist/tumata-server.exe

echo "Backend built: ../dist/tumata-server.exe"

# ---------- Frontend (React) ----------
echo "=== Building frontend (React) ==="
cd "$(dirname "$0")/frontend"
# Install Node dependencies (pnpm is used in the project)
pnpm install
# Build the React app
pnpm run build

echo "Frontend built: ./dist"

echo "=== Build complete ==="

