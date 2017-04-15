#!/bin/sh

# Substitute env vars
envsubst \
    '$API_REQUEST_TIMEOUT_MILLIS' \
    < /app/config.json.template \
    > /app/config.json

envsubst \
    '$SERVER_HTTP_PORT,$API_HOST,$API_PORT' \
    < /etc/nginx/nginx.conf.template \
    > /etc/nginx/nginx.conf

# Start nginx
nginx -g 'daemon off;' &

# Trap terminate signals
trap 'nginx -s stop' TERM QUIT

# Wait for nginx to terminate
wait