#!/bin/sh

# Generate random crypto secret if not defined
export CRYPTO_SECRET=${CRYPTO_SECRET:-$(cat /dev/urandom | tr -dc 'a-zA-Z0-9~!@#$%^&*_-' | fold -w 64 | head -n 1)}

/app/bin/zoonavigator-play