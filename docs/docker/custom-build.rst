============
Custom build
============

If you want to build ZooNavigator Docker image yourself, you can do so like this:

.. code-block:: bash

  git clone https://github.com/elkozmon/zoonavigator.git

  cd zoonavigator

  git submodule update --init --recursive

  docker build \
    -t my-zoonavigator \
    -f build/docker/Dockerfile \
    --build-arg APP_VERSION=my-build \
    .


.. note::

   Note that the `docker build` command is executed from within project's root directory
