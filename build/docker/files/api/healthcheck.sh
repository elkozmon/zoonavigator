#!/usr/bin/env sh

if [ -n "$HTTPS_PORT" ]
then
  SCHEME="https"
  PORT="$HTTPS_PORT"
else
  SCHEME="http"
  PORT="$HTTP_PORT"
fi

curl -k -f ${SCHEME}://localhost:${PORT}${BASE_HREF} || exit 1
