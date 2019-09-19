[![](https://img.shields.io/docker/cloud/automated/elkozmon/zoonavigator.svg?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/docker/pulls/elkozmon/zoonavigator.svg?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/docker/stars/elkozmon/zoonavigator.svg?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/microbadger/layers/elkozmon/zoonavigator?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/microbadger/image-size/elkozmon/zoonavigator?style=flat-square)](https://hub.docker.com/r/elkozmon/zoonavigator)

ZooNavigator
============

ZooNavigator is a **web-based browser UI & editor for ZooKeeper** with many features.


ZooKeeper versions 3.4.x and 3.5.x are currently supported.


[**:blue_book: Read official docs for more info, screenshots :camera: and instructions how to use ZooNavigator. :fire:**](https://www.elkozmon.com/zoonavigator)

Quick start
-----------

Start Docker container:

```
docker run \
  -d --network host \
  --name zoonavigator \
  --restart unless-stopped \
  elkozmon/zoonavigator:latest
```

Go to [http://localhost:9000](http://localhost:9000).

Optionally, change the port by adding `-e HTTP_PORT=1234` as an option to the command above.

License
-------

The project is licensed under Affero General Public License version 3.0 (AGPLv3).
