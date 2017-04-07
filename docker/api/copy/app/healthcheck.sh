#!/bin/sh

curl -f http://localhost:${SERVER_HTTP_PORT}/api/healthcheck || exit 1