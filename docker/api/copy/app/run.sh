#!/bin/sh

# Remove pid file
rm -f "/app/RUNNING_PID"

# Generate random crypto secret if not defined
export CRYPTO_SECRET=${CRYPTO_SECRET:-$(cat /dev/urandom | tr -dc 'a-zA-Z0-9~!@#$%^&*_-' | fold -w 64 | head -n 1)}

# Start application
/app/bin/zoonavigator-play &
APP_PID=$!

# Trap terminate signals
trap 'kill "$APP_PID"' TERM QUIT

# Wait for application to terminate
wait "$APP_PID"