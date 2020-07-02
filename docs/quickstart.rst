===========
Quick Start
===========

You can run ZooNavigator from:

* `Docker`_
* `Snap`_

----

******
Docker
******

Start Docker container with `ZooNavigator Docker image <https://hub.docker.com/r/elkozmon/zoonavigator>`_:

.. code-block:: bash

  docker run \
    -d --network host \
    -e HTTP_PORT=9000 \
    --name zoonavigator \
    --restart unless-stopped \
    elkozmon/zoonavigator:latest

Go to http://localhost:9000.

**Windows and Mac users:**
If wanting to access ZooKeeper running locally on host machine (not in Docker container), `follow this advice <https://github.com/elkozmon/zoonavigator/issues/40#issue-495910852>`_.

****
Snap
****

Install ZooNavigator from `Snap store <https://snapcraft.io/zoonavigator>`_:

.. code-block:: bash

  sudo snap install zoonavigator

Go to http://localhost:9000.
