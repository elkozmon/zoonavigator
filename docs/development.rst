=================
Development Guide
=================

`ZooNavigator GitHub repository <https://github.com/elkozmon/zoonavigator>`_ contains the backend API (in the :code:`api/` directory) and Angular app (in the :code:`web/` directory).

Development Environment
=======================

For a streamlined development experience, this repository uses `devenv <https://devenv.sh/>`_ which provides a declarative development environment configuration and sets up all necessary dependencies.

Local Development
=================

First, start the API server:

.. code-block:: bash

  cd api
  sbt play/run

Play HTTP server should now be listening on port 9000. The default port is defined in :code:`api/play/conf/application.conf`.

Next, start up the Angular app:

.. code-block:: bash

  cd web
  npm install
  npm run dev

This starts up Angular development server with proxy configured in :code:`web/proxy.conf.json` which will forward API requests to http://localhost:9000.

Once that's done, open up http://localhost:4200 in your browser and you should see the `Connect form <./_static/images/screenshots/connect-form.png>`_.
