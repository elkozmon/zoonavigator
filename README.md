[![](https://github.com/elkozmon/zoonavigator/actions/workflows/publish.yml/badge.svg)](https://github.com/elkozmon/zoonavigator/actions/workflows/publish.yml)
[![](https://readthedocs.org/projects/zoonavigator/badge/?version=latest)](https://zoonavigator.elkozmon.com/en/latest/?badge=latest)
[![](https://img.shields.io/docker/pulls/elkozmon/zoonavigator.svg)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/docker/stars/elkozmon/zoonavigator.svg)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://img.shields.io/docker/image-size/elkozmon/zoonavigator?sort=semver)](https://hub.docker.com/r/elkozmon/zoonavigator)
[![](https://snapcraft.io//zoonavigator/badge.svg)](https://snapcraft.io/zoonavigator)
[![](https://snapcraft.io//zoonavigator/trending.svg?name=0)](https://snapcraft.io/zoonavigator)

# ZooNavigator

ZooNavigator is a **feature-rich web interface for ZooKeeper**.


ZooKeeper versions 3.5.x to 3.9.x are currently supported.


[**📘 Read official docs for more info, screenshots 📷 and instructions how to use ZooNavigator. 🔥**](https://zoonavigator.elkozmon.com)

## Quick start

1. **Run ZooNavigator** via [Docker](#docker) or [Snap](#snap)
2. **Open your browser** and go to http://localhost:9000
3. **Enter connection details:**
   - **Connection String:** Your ZooKeeper ensemble (e.g., `zk1:2181,zk2:2181,zk3:2181`)
   - **Auth Info:** Optional, feel free to leave empty
4. **Click Connect**

### Docker

Run the ZooNavigator Docker image from [Docker Hub](https://hub.docker.com/r/elkozmon/zoonavigator):

```bash
docker run \
  -d \
  -p 9000:9000 \
  -e HTTP_PORT=9000 \
  --name zoonavigator \
  --restart unless-stopped \
  elkozmon/zoonavigator
```

**Note:**

If you want to access ZooKeeper running locally on host machine (not in Docker container):

- **Linux** users may use `--net host` instead of exposing the port
- **Windows and Mac** users should [follow this advice](https://github.com/elkozmon/zoonavigator/issues/40#issue-495910852)

### Snap

Install ZooNavigator from [Snap store](https://snapcraft.io/zoonavigator):

```bash
sudo snap install zoonavigator
```


## License

The project is licensed under Affero General Public License version 3.0 (AGPLv3).
