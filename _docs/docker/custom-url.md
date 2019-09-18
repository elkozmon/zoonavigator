---
title: Custom URL
category: docker
order: 3
---

By default ZooNavigator will be available on root of your domain, e.g. `https://www.example.com/`

If you need to deploy ZooNavigator with custom URL using a suffix like `/zoonavigator`, you will have to build ZooNavigator's Docker image yourself.

There is a Docker build argument for that called `BASE_HREF` in ZooNavigator's Dockerfile. You will need to clone its [Git repository](https://github.com/elkozmon/zoonavigator) and from within that directory build your own Docker image like so:

```
git submodule init

docker build \
  -t my-zoonavigator \
  -f build/docker/Dockerfile \
  --build-arg BASE_HREF=/zoonavigator/ \
  .
```

> Note that `BASE_HREF` has to start and end with forward slash `/`
