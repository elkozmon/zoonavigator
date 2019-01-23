---
title: Custom URL
category: how-tos
order: 2
---

By default ZooNavigator will be available on root of your domain, e.g. `https://www.example.com/`

If you need to deploy ZooNavigator with custom URL using a suffix like `/zoonavigator`, you will have to build ZooNavigator's Web Docker image yourself.

There is a Docker build argument for that called `BASE_HREF` in ZooNavigator's Web Dockerfile. You will need to clone its [Git repository](https://github.com/elkozmon/zoonavigator-web) and from within that directory build your own Docker image like so:

`docker build -t my-zoonavigator-web --build-arg BASE_HREF=/zoonavigator/ .`

> Note that `BASE_HREF` has to start and end with forward slash `/`
