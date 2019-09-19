---
title: Usage
category: basics
order: 1
---

**ZooNavigator is available as a Docker image**. 

Start it using this command:

```
docker run \
  -d --network host \
  --name zoonavigator \
  --restart unless-stopped \
  elkozmon/zoonavigator:latest
```

Once you get that running, simply open up [http://localhost:9000](http://localhost:9000).

You can change the port by adding `-e HTTP_PORT=1234` as an option to the command above.
