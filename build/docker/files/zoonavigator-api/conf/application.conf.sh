#!/usr/bin/env sh

if [ -n "$REQUEST_TIMEOUT_MILLIS"]
then
  cat <<EOF
# Client will cancel requests that take longer than this
zoonavigator.requestTimeout = ${REQUEST_TIMEOUT_MILLIS} milliseconds

EOF

fi

if [ -n "$AUTO_CONNECT_CONNECTION_ID"]
then
  cat <<EOF
# Client will cancel requests that take longer than this
zoonavigator.autoConnect = \${zoonavigator.connection${AUTO_CONNECT_CONNECTION_ID}.name}

EOF

fi

cat <<EOF
# Predefined connections
zoonavigator.connections = []

EOF

i="001";

while NAME="CONNECTION_${i}_NAME" && CONN="CONNECTION_${i}_CONN" && [ -n "${!NAME}" ] && [ -n "${!CONN}" ]
do
  cat <<EOF
# Predefined connection ${i}
zoonavigator.connection${i} = {
  name = "${!NAME}"
  conn = "${!CONN}"
  auth = []
}

EOF

# TODO AUTH

  cat <<EOF
zoonavigator.connections = \${zoonavigator.connections} [\${zoonavigator.connection${i}}]

EOF
  printf -v i "%03d" $(expr $i + 1)
done

#for i in $(seq -f "%03g" 1 $CONFIG_PREDEF_CONNECTIONS_LIMIT)
#do
#  cat <<EOF
#{{ if .Env.CONNECTION_${i}_NAME }}
#  {{ if .Env.CONNECTION_${i}_CONN }}
#zoonavigator.connection${i} = {
#  name = "{{ .Env.CONNECTION_${i}_NAME }}"
#  conn = "{{ .Env.CONNECTION_${i}_CONN }}"
#  auth = []
#}
#EOF
#
#  for j in $(seq -f "%03g" 1 $CONFIG_PREDEF_CONNECTIONS_AUTH_LIMIT)
#  do
#    cat <<EOF
#{{ if .Env.CONNECTION_${i}_AUTH_${j}_SCHEME }}
#  {{ if .Env.CONNECTION_${i}_AUTH_${j}_ID }}
#zoonavigator.connection${i}.auth = \${zoonavigator.connection${i}.auth} [{
#  scheme = "{{ .Env.CONNECTION_${i}_AUTH_${j}_SCHEME }}"
#  id = "{{ .Env.CONNECTION_${i}_AUTH_${j}_ID }}"
#}]
#  {{ end }}
#{{ end }}
#EOF
#  done
#
#  cat <<EOF
#zoonavigator.connections = \${zoonavigator.connections} [\${zoonavigator.connection${i}}]
#  {{ end }}
#{{ end }}
#
#EOF
#done
