=================
Development Guide
=================

Development setup requires `NPM <https://www.npmjs.com/>`_ and `SBT <https://www.scala-sbt.org/>`_ to be installed on your machine.

ZooNavigator API handles communication with ZooKeeper while
ZooNavigator Web is the front-end which in turn talks to the ZooNavigator API.


First, let's get ZooNavigator API running:

.. code-block:: bash

  git clone https://github.com/elkozmon/zoonavigator-api.git
  cd zoonavigator-api
  sbt play/run

Play HTTP server should now be listening on port 9000. The default port is defined in :code:`play/conf/application.conf`.

Next step is to start up ZooNavigator Web:

.. code-block:: bash

  git clone https://github.com/elkozmon/zoonavigator-web.git
  cd zoonavigator-web
  npm install -g @angular/cli
  npm install
  npm run dev

This starts up Angular development server with proxy configured in :code:`proxy.conf.json` that will forward API requests to http://localhost:9000 where ZooNavigator API should be running.

Once you've done all that open up http://localhost:4200 in your browser and you should see the `Connect form <./_static/images/screenshots/connect-form.png>`_.
