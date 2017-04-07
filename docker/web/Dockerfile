FROM nginx:1.11
MAINTAINER Lubos Kozmon <lubosh91@gmail.com>

# Default config
ENV SERVER_HTTP_PORT=8000 \
    API_HOST=api \
    API_PORT=9000 \
    API_REQUEST_TIMEOUT_MILLIS=10000

# Server HTTP port
EXPOSE 8000

# Copy setup files
COPY ./copy /

RUN chmod +x \
    /app/run.sh \
    /app/healthcheck.sh

# Add health check
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean

HEALTHCHECK --interval=5m --timeout=3s \
    CMD /app/healthcheck.sh

# Copy dist files
COPY ./src/dist /app

CMD ["/app/run.sh"]
