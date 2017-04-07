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

# Start server
nginx -g 'daemon off;'