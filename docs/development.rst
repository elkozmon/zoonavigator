=================
Development Guide
=================

Repository Structure
====================

The `ZooNavigator codebase <https://github.com/elkozmon/zoonavigator>`_ is organized as a monorepo:

.. code-block::

   zoonavigator/
   ├── api/                   # Backend (Scala/Play Framework)
   ├── web/                   # Frontend (Angular/TypeScript)
   ├── build/                 # Build configurations
   │   ├── docker/            # Docker image build files
   │   └── snap/              # Snapcraft package configuration
   ├── docs/                  # Documentation
   └── devenv.nix             # Development environment

Local Development
=================

By default, the API development server runs on port :code:`9000` while Angular serves the frontend on port :code:`4200`. The frontend includes a proxy configuration in ``web/proxy.conf.js`` that routes API requests from port :code:`4200` to the backend API server.

Using devenv
------------

For a streamlined development experience, this repository uses `devenv <https://devenv.sh/>`_ which provides a declarative development environment configuration and sets up all necessary dependencies.

**Start all development services:**

.. code-block:: bash

   devenv up

This command starts all development services including the backend API, frontend and documentation server with auto-reloading. To run in the background, use the :code:`-d` option:

.. code-block:: bash

   devenv up -d

**Enter the development shell:**

.. code-block:: bash

   devenv shell

This command enters a shell with all development dependencies available (Scala, Node.js, etc.). You can use this to run individual commands like :code:`sbt`, :code:`npm`, or any other tools needed for development.

.. note::
   You can use `direnv <https://direnv.net/>`_ to automatically load the development environment when entering the project directory. After installing direnv, run :code:`direnv allow` in the project root to enable automatic environment loading.

**Port configuration:**

If you need to override default ports, create a :code:`devenv.local.nix` file in the project root:

.. code-block:: nix

   _:
   {
      env = {
         API_PORT = 9001;
         WEB_PORT = 4201;
         DOCS_PORT = 8001;
      };
   }

Manual Setup
------------

If you prefer not to use devenv, you can start the dev servers manually:

**Start the API server:**

.. code-block:: bash

   cd api
   sbt play/run

**Start the Angular server:**

.. code-block:: bash

   cd web
   npm install
   npm run dev
