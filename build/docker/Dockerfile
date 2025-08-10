ARG DOCKERIZE_VERSION=0.7.0
ARG DEBUG=0

FROM ubuntu:22.04 AS dockerize

ARG DOCKERIZE_VERSION

# Install dependencies
RUN apt-get update \
  && apt-get install -y curl

# Get dockerize
RUN curl \
    -Lo dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz \
    https://github.com/jwilder/dockerize/releases/download/v${DOCKERIZE_VERSION}/dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz \
  && tar xzvf dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz -C /usr/local/bin \
  && rm dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz

FROM node:20-bookworm-slim AS npm

# Install required packages
RUN apt-get update \
  && apt-get install -y make g++

# Copy package files
WORKDIR /src
COPY /web/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY /web .
COPY /build/docker/files/web .

# Get dockerize
COPY --from=dockerize /usr/local/bin/dockerize /usr/local/bin/dockerize

# Create env config for web app
ARG APP_VERSION
ARG DOCS_URL
ARG DEBUG

RUN dockerize \
    -template ./environment.ts.template:./src/environments/environment.prod.ts

# Build web app
RUN npm run build:prod \
  && mv dist /app

FROM sbtscala/scala-sbt:eclipse-temurin-jammy-17.0.5_8_1.9.3_2.12.18 AS sbt

# Install required packages
RUN apt-get update \
  && apt-get install -y zip

# Copy build files
WORKDIR /src
COPY /api/build.sbt ./
COPY /api/project ./project/

# Download dependencies
RUN sbt update

# Copy source files
COPY /api .
COPY --from=npm /app ./play/public

# Build api
RUN sbt play/dist \
  && VERSION=$(ls play/target/universal/zoonavigator-play-*.zip | sed -E 's/.*zoonavigator-play-(.*).zip$/\1/') \
  && unzip play/target/universal/zoonavigator-play-$VERSION.zip \
  && mv zoonavigator-play-$VERSION /app

FROM ubuntu:22.04 AS ubuntu

# Get dockerize
COPY --from=dockerize /usr/local/bin/dockerize /usr/local/bin/dockerize

# Copy app files
WORKDIR /app
COPY --from=sbt /app .
COPY /build/docker/files/web .
COPY /build/docker/files/api .
COPY /api/play/conf/application.conf ./conf/application.conf

# Create scripts and make them executable
ARG DOCS_URL
RUN dockerize \
    -template ./run.sh.template:./run.sh \
  && chmod +x \
    ./run.sh \
    ./healthcheck.sh \
    ./conf/zoonavigator.conf.sh

# Change permissions
RUN chgrp -R 0 . \
  && chmod -R g=u .

FROM eclipse-temurin:17-jdk-jammy

# Default config
ENV HTTP_PORT=9000 \
    REQUEST_MAX_SIZE_KB=10000 \
    REQUEST_TIMEOUT_MILLIS=10000 \
    ZK_CLIENT_TIMEOUT_MILLIS=5000 \
    ZK_CONNECT_TIMEOUT_MILLIS=5000

# Install dependencies
RUN apt-get update \
  && apt-get install -y curl krb5-user \
  && rm -rf /var/lib/apt/lists/*

# Get dockerize
COPY --from=dockerize /usr/local/bin/dockerize /usr/local/bin/dockerize

# Change working directory
WORKDIR /app

# Change permissions
RUN chgrp -R 0 . \
  && chmod -R g=u .

# Copy app files
COPY --from=ubuntu /app .

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD ./healthcheck.sh

# Expose default HTTP port
EXPOSE 9000

ENTRYPOINT ["./run.sh"]
USER 1000

ARG APP_VERSION
ARG DOCS_URL
ARG VCS_URL="https://github.com/elkozmon/zoonavigator"
ARG VCS_REF
ARG BUILD_DATE

LABEL \
  maintainer="Lubos Kozmon <contact@elkozmon.com>" \
  org.label-schema.name="ZooNavigator" \
  org.label-schema.description="Web-based ZooKeeper UI" \
  org.label-schema.url=${DOCS_URL} \
  org.label-schema.vcs-url=${VCS_URL} \
  org.label-schema.vcs-ref=${VCS_REF} \
  org.label-schema.version=${APP_VERSION} \
  org.label-schema.build-date=${BUILD_DATE} \
  org.label-schema.docker.cmd="docker run -d -p 9000:9000 -e HTTP_PORT=9000 --name zoonavigator --restart unless-stopped elkozmon/zoonavigator"
