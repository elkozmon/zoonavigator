---
title: Usage
category: basics
order: 1
---

ZooNavigator is **available as a Docker image** - well, two actually.

> Make sure that you use matching versions for both images

> Docker images with **'latest' tag are development builds**, therefore it is recommended to always **use the ones with version tags**

Since there are two dependent Docker images it's **recommended to use Docker Compose**.  
Below is the Compose file for the latest release:

```yaml
version: '2.1'

services:
  web:
    image: elkozmon/zoonavigator-web:0.6.1
    container_name: zoonavigator-web
    ports:
     - "8000:8000"
    environment:
      WEB_HTTP_PORT: 8000
      API_HOST: "api"
      API_PORT: 9000
    depends_on:
     - api
    restart: always
  api:
    image: elkozmon/zoonavigator-api:0.6.1
    container_name: zoonavigator-api
    environment:
      API_HTTP_PORT: 9000
    restart: always

```

Once you get that running, you can open up your web browser and navigate to port 8000 and ZooNavigator's Connect form should pop up.
