#!/usr/bin/env bash

if [ -n "$REQUEST_TIMEOUT_MILLIS" ]
then
  cat <<EOF
# Client will cancel requests that take longer than this
zoonavigator.requestTimeout = ${REQUEST_TIMEOUT_MILLIS} milliseconds

EOF

fi

if [ -n "$AUTO_CONNECT_CONNECTION_ID" ]
then
  CONN="CONNECTION_${AUTO_CONNECT_CONNECTION_ID}_CONN"

  # throw error if name empty
  if [ -z "${!CONN}" ]
  then
    >&2 cat <<EOF
Invalid Auto Connect configuration: connection '${AUTO_CONNECT_CONNECTION_ID}' not properly defined.
Make sure following environment variables are set:
 - CONNECTION_${AUTO_CONNECT_CONNECTION_ID}_CONN

EOF
    exit 1;
  fi

  cat <<EOF
# Optional auto connect
zoonavigator.autoConnect = "${AUTO_CONNECT_CONNECTION_ID}"

EOF

fi

CONNECTION_IDS=$(env | cut -f1 -d= | grep -E "CONNECTION_.*?_CONN" | sed -E "s/CONNECTION_(.*)_CONN/\1/g")

for ID in $CONNECTION_IDS
do
  NAME="CONNECTION_${ID}_NAME" # this is optional
  CONN="CONNECTION_${ID}_CONN"

  cat <<EOF
# Predefined connection ${ID}
zoonavigator.connections.${ID} = {
EOF

  # add connection name if defined
  if [ -n "${!NAME}" ]
  then
    cat <<EOF
  name = "${!NAME}"
EOF
  fi

  cat <<EOF
  conn = "${!CONN}"
  auth = []
}

EOF

  CONNECTION_AUTH_IDS=$(env | cut -f1 -d= | grep -E "CONNECTION_${ID}_AUTH_(.*)_SCHEME" | sed -E "s/CONNECTION_${ID}_AUTH_(.*)_SCHEME/\1/g")

  for AUTH_ID in $CONNECTION_AUTH_IDS
  do
    SCHEME_NAME="CONNECTION_${ID}_AUTH_${AUTH_ID}_SCHEME"
    SCHEME_ID="CONNECTION_${ID}_AUTH_${AUTH_ID}_ID"

    # throw error if name or id empty
    if [ -z "${!SCHEME_NAME}" ] || [ -z "${!SCHEME_ID}" ]
    then
      >&2 cat <<EOF
Invalid Auth '${AUTH_ID}' configuration in Connection '${ID}'.
Make sure following environment variables are set:
 - ${SCHEME_NAME}
 - ${SCHEME_ID}

EOF
      exit 1;
    fi

    cat <<EOF
zoonavigator.connections.${ID}.auths.${AUTH_ID} = {
  scheme = "${!SCHEME_NAME}"
  id = "${!SCHEME_ID}"
}

zoonavigator.connections.${ID}.auth = \${zoonavigator.connections.${ID}.auth} [\${zoonavigator.connections.${ID}.auths.${AUTH_ID}}]

EOF
  done
done
