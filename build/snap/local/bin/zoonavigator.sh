#!/bin/sh -e

# Exit if any command fails
set -e

# Remove pid file
PID_FILE="$SNAP_DATA/.pid"
rm -f "$PID_FILE"

# Get config
SECRET_KEY=$(cat $SNAP_DATA/.secret)
JAVA_OPTS=$(cat $SNAP_DATA/.javaopts)
JAVA_OPTS="$JAVA_OPTS \
  -XX:+UseContainerSupport \
  -server \
  -Dplay.http.secret.key=$SECRET_KEY \
  -Dpidfile.path=$PID_FILE \
  -Dzookeeper.kinit=/usr/bin/kinit"

# Start application
exec java \
  ${JAVA_OPTS} \
  play.core.server.ProdServerStart
