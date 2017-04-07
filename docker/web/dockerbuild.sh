#!/bin/sh

git submodule update && \
    cd src && \
    npm install && \
    ng build --prod && \
    cd .. && \
    docker build $@

if [ $? -eq 0 ]; then
    echo "Docker build completed"
else
    echo "Docker build failed"
fi

