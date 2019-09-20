[![](https://img.shields.io/docker/cloud/automated/elkozmon/zoonavigator.svg?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/docker/pulls/elkozmon/zoonavigator.svg?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/docker/stars/elkozmon/zoonavigator.svg?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/microbadger/layers/elkozmon/zoonavigator?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/microbadger/image-size/elkozmon/zoonavigator?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)

ZooNavigator
============

ZooNavigator is a **web-based browser UI & editor for ZooKeeper** with many features.


ZooKeeper versions 3.4.x and 3.5.x are currently supported.


[**📘 Read official docs for more info, screenshots 📷 and instructions how to use ZooNavigator. 🔥**](https://www.elkozmon.com/zoonavigator)

Quick start
-----------

Start Docker container:

```
docker run \
  -d --network host \
  -e HTTP_PORT=9000 \
  --name zoonavigator \
  --restart unless-stopped \
  elkozmon/zoonavigator:latest
```

Go to [http://localhost:9000](http://localhost:9000).

If wanting to access ZooKeeper running locally on host machine (not in Docker container), [follow this advice](https://github.com/elkozmon/zoonavigator/issues/40#issue-495910852).

License
-------

The project is licensed under Affero General Public License version 3.0 (AGPLv3).
