ARG APP_VERSION
ARG SBT_VERSION=1.2.8
ARG SBT_GPG_KEY=99E82A75642AC823
ARG DOCKERIZE_VERSION=0.6.1
ARG BASE_HREF="/"
ARG DEBUG=0

FROM node:11.15.0-alpine as npm
MAINTAINER Lubos Kozmon <contact@elkozmon.com>

ARG DOCKERIZE_VERSION
ARG APP_VERSION
ARG BASE_HREF
ARG DEBUG

# Validate base href
RUN echo ${BASE_HREF} | grep -Eq '^\/(.*\/)?$' || (>&2 echo "BASE_HREF must start and end with a forward slash" && exit 1)

# Copy source code
WORKDIR /src
COPY /zoonavigator-web .
COPY /build/docker/files/zoonavigator-web .

# Install required packages
RUN apk --no-cache add tar curl python-dev make g++

# Get dockerize
RUN curl \
    -Lo dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz \
    https://github.com/jwilder/dockerize/releases/download/v${DOCKERIZE_VERSION}/dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz \
  && tar xzvf dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz -C /usr/local/bin \
  && rm dockerize-alpine-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz

# Create env config for web app
RUN dockerize \
    -template ./environment.ts.template:./src/environments/environment.prod.ts

# Install dependencies & build
RUN npm install -g @angular/cli \
  && npm install \
  && ng build --prod --base-href ${BASE_HREF} \
  && mv dist /app

FROM openjdk:8u151-jdk-alpine3.7 as sbt

ARG SBT_VERSION
ARG SBT_GPG_KEY

# Copy source files
WORKDIR /src
COPY /zoonavigator-api .
COPY --from=npm /app ./play/public

# Install sbt
RUN apk --no-cache add aria2 gnupg ca-certificates bash \
  && aria2c -x4 "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz" \
  && aria2c -x4 "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz.asc" \
  && gpg --keyserver keyserver.ubuntu.com --recv-keys ${SBT_GPG_KEY} \
  && gpg --verify sbt-${SBT_VERSION}.tgz.asc sbt-${SBT_VERSION}.tgz \
  && tar xvfz sbt-${SBT_VERSION}.tgz -C /usr/local \
  && ln -s /usr/local/sbt/bin/sbt /usr/bin/sbt

# Build project
RUN sbt play/dist \
  && VERSION=$(ls play/target/universal/zoonavigator-play-*.zip | sed -E 's/.*zoonavigator-play-(.*).zip$/\1/') \
  && unzip play/target/universal/zoonavigator-play-$VERSION.zip \
  && mv zoonavigator-play-$VERSION /app

FROM openjdk:14-jdk-slim

ARG BASE_HREF

# Default config
ENV HTTP_PORT=9000 \
    SESSION_TIMEOUT_MILLIS=3600000 \
    REQUEST_TIMEOUT_MILLIS=10000 \
    ZK_CLIENT_TIMEOUT_MILLIS=5000 \
    ZK_CONNECT_TIMEOUT_MILLIS=5000

# Install dependencies
RUN apt-get update \
  && apt-get install -y curl krb5-user \
  && apt-get clean

# Change working directory
WORKDIR /app

# Create and switch to a non-root user
RUN groupadd -g 1000 zoonavigator \
  && useradd -r -u 1000 -g zoonavigator zoonavigator\
  && chown -R zoonavigator:zoonavigator .

USER zoonavigator:zoonavigator

# Copy app files
COPY --chown=zoonavigator:zoonavigator --from=sbt /app .
COPY --chown=zoonavigator:zoonavigator --from=npm /usr/local/bin/dockerize /usr/local/bin/dockerize
COPY --chown=zoonavigator:zoonavigator /build/docker/files/zoonavigator-api .
COPY --chown=zoonavigator:zoonavigator /build/docker/files/zoonavigator-web .

# Create scripts and make them executable
RUN dockerize \
    -template ./run.sh.template:./run.sh \
    -template ./healthcheck.sh.template:./healthcheck.sh \
  && chmod +x \
    ./run.sh \
    ./healthcheck.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD ./healthcheck.sh

# Expose default HTTP port
EXPOSE 9000

ENTRYPOINT ["./run.sh"]
