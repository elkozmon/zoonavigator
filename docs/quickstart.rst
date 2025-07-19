===========
Quick Start
===========

1. **Run ZooNavigator** via `Docker`_ or `Snap`_
2. **Open your browser** and go to http://localhost:9000
3. **Enter connection details:**

   - **Connection String:** Your ZooKeeper ensemble (e.g., :code:`zk1:2181,zk2:2181,zk3:2181`)
   - **Auth Info:** Optional, feel free to leave empty

4. **Click Connect**

Docker
======

Run the ZooNavigator Docker image from `Docker Hub <https://hub.docker.com/r/elkozmon/zoonavigator>`_:

.. code-block:: bash

  docker run \
    -d \
    -p 9000:9000 \
    -e HTTP_PORT=9000 \
    --name zoonavigator \
    --restart unless-stopped \
    elkozmon/zoonavigator

.. note::
  If you want to access ZooKeeper running locally on host machine (not in Docker container):

  - **Linux** users may use :code:`--net host` instead of exposing the port
  - **Windows and Mac** users should `follow this advice <https://github.com/elkozmon/zoonavigator/issues/40#issue-495910852>`_

Snap
====

Install ZooNavigator from `Snap store <https://snapcraft.io/zoonavigator>`_:

.. code-block:: bash

  sudo snap install zoonavigator

.. rubric:: Next Steps

- Explore the :doc:`features` ZooNavigator has to offer
- Learn how to configure your :doc:`Docker <docker/configuration>` or :doc:`Snap <snap/configuration>` deployments
