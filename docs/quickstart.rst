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
    -d \
    -p 9000:9000 \
    -e HTTP_PORT=9000 \
    --name zoonavigator \
    --restart unless-stopped \
    elkozmon/zoonavigator:latest

Go to http://localhost:9000.

If wanting to access ZooKeeper running locally on host machine (not in Docker container), Linux users may use :code:`--net host` instead of exposing the port, however Windows and Mac users should `follow this advice <https://github.com/elkozmon/zoonavigator/issues/40#issue-495910852>`_ instead.

****
Snap
****

Install ZooNavigator from `Snap store <https://snapcraft.io/zoonavigator>`_:

.. code-block:: bash

  sudo snap install zoonavigator

Go to http://localhost:9000.
