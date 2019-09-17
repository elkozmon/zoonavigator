---
title: Usage
category: basics
order: 1
---

ZooNavigator is **available as a Docker image**. 

Start it using this command:

```shell script
docker run \
  -d --network host \
  --name zoonavigator \
  --restart unless-stopped \
  elkozmon/zoonavigator:latest
```

Once you get that running, you can open up your web browser and navigate to port 8000 and ZooNavigator's Connect form should pop up.

You can change the port by adding `-e HTTP_PORT=1234` as an option to the command above.
