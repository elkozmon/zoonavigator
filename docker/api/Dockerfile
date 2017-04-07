FROM openjdk:8
MAINTAINER Lubos Kozmon <lubosh91@gmail.com>

# Default config
ENV SERVER_HTTP_PORT=9000 \
    SESSION_TTL_MILLIS=900000 \
    ZK_CLIENT_TTL_MILLIS=5000 \
    ZK_CONNECT_TIMEOUT_MILLIS=5000

# Copy files
COPY ./src/play/target/universal/stage /app
COPY ./copy /

RUN chmod +x \
    /app/run.sh \
    /app/healthcheck.sh

# Add health check
HEALTHCHECK --interval=5m --timeout=3s \
    CMD /app/healthcheck.sh

EXPOSE 9000

CMD ["/app/run.sh"]
