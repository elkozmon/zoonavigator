---
title: Usage
category: basics
order: 1
---

ZooNavigator is **available as a Docker image**.

> Docker images with **'latest' tag are development builds**, therefore it is recommended to always **use the ones with version tags!**

Simply start the Docker container:

```shell script
docker run \
  -d --network host \
  --name zoonavigator \
  --restart unless-stopped \
  elkozmon/zoonavigator:latest
```

Once you get that running, you can open up your web browser and navigate to port 8000 and ZooNavigator's Connect form should pop up.
