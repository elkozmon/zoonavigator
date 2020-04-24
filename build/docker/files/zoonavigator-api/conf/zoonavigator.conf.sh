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
  NAME="CONNECTION_${AUTO_CONNECT_CONNECTION_ID}_NAME"

  # throw error if name empty
  if [ -z "${!NAME}" ]
  then
    >&2 cat <<EOF
Invalid Auto Connect configuration: connection '${AUTO_CONNECT_CONNECTION_ID}' not properly defined.

Make sure following environment variables are set:
 - CONNECTION_${AUTO_CONNECT_CONNECTION_ID}_NAME
 - CONNECTION_${AUTO_CONNECT_CONNECTION_ID}_CONN
EOF
    exit 1;
  fi

  cat <<EOF
# Client will cancel requests that take longer than this
zoonavigator.autoConnect = \${zoonavigator.connection.${AUTO_CONNECT_CONNECTION_ID}.name}

EOF

fi

cat <<EOF
# Predefined connections
zoonavigator.connections = []

EOF

CONNECTION_IDS=$(env | cut -f1 -d= | grep -E "CONNECTION_.*?_NAME" | sed -E "s/CONNECTION_(.*)_NAME/\1/g")

for ID in $CONNECTION_IDS
do
  NAME="CONNECTION_${ID}_NAME"
  CONN="CONNECTION_${ID}_CONN"

  # throw error if conn or name empty
  if [ -z "${!CONN}" ] || [ -z "${!NAME}" ]
  then
    >&2 cat <<EOF
Invalid Connection '${ID}' configuration.

Make sure following environment variables are set:
 - ${NAME}
 - ${CONN}
EOF
    exit 1;
  fi

  cat <<EOF
# Predefined connection ${ID}
zoonavigator.connection.${ID} = {
  name = "${!NAME}"
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
zoonavigator.connection.${ID}.auths.${AUTH_ID} = {
  scheme = "${!SCHEME_NAME}"
  id = "${!SCHEME_ID}"
}

zoonavigator.connection.${ID}.auth = \${zoonavigator.connection.${ID}.auth} [\${zoonavigator.connection.${ID}.auths.${AUTH_ID}}]

EOF
  done

  cat <<EOF
zoonavigator.connections = \${zoonavigator.connections} [\${zoonavigator.connection.${ID}}]

EOF
done
