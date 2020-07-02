==================
Preset Connections
==================

Instead of manually entering connection string every time you open ZooNavigator, you can preset your ZooKeeper clusters when starting the Docker image and then select which cluster to connect to from the drop-down in the `Connect form <../_static/images/screenshots/connect-form.png>`_.

Adding a Preset Connection
--------------------------

Each connection must have a unique id, which is part of the configuration option name.

To add a preset connection, you must enter a valid connection string as :code:`zoonavigator.connection.<id>.connection-string` configuration option.

Optionally, you can add a name to your preset connection using configuration option :code:`zoonavigator.connection.<id>.name` which will be displayed in the UI instead of the id.

.. note::

   Replace <id> by any id string you choose.

For example, if one wants to add a ZooKeeper cluster running at *localhost:2181*, name it "Local ZooKeeper" and give it id *localzk*, then he/she would set the configuration options like so:

.. code-block:: bash

  snap set zoonavigator zoonavigator.connection.localzk.name=Local ZooKeeper
  snap set zoonavigator zoonavigator.connection.localzk.connection-string=localhost:2181

Adding auth entry to a Preset Connection
----------------------------------------

Similarly, one can add auth entry to any Preset Connection.

Each auth entry also has to have a unique id (unique constraint only applies for auth entries for the same connection). To add auth entry you need to set these configuration option:

- :code:`zoonavigator.connection.<connectionId>.auth.<authId>.scheme`
- :code:`zoonavigator.connection.<connectionId>.auth.<authId>.id`
