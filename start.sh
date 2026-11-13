#!/usr/bin/env bash
# TUMATA runtime entrypoint.
#
# The server binary is built by the multi-stage Dockerfile (see ./Dockerfile).
# Do NOT try to install Go or build from source here: Hostless runs this script
# in a read-only runtime image where apt/go are not available.
set -e

cd "$(dirname "$0")"

if [ ! -x ./tumata-server ]; then
  echo "ERROR: ./tumata-server not found. Build the image with Dockerfile first." >&2
  exit 1
fi

exec ./tumata-server
