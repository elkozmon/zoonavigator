==================
Preset Connections
==================

Instead of manually entering connection string every time you open ZooNavigator, you can preset your ZooKeeper clusters when starting the Docker image and then select which cluster to connect to from the drop-down in the `Connect form <../_static/images/screenshots/connect-form.png>`_.

Adding a Preset Connection
--------------------------

Each connection must have a unique id, which is part of the environment variable name.

To add a preset connection, you must set both these environment variable to a non-empty string:

- :code:`CONNECTION_<ID>_NAME`
- :code:`CONNECTION_<ID>_CONN`

.. note::

   Replace <ID> by any id string you chose

For example, if one wants to add a ZooKeeper cluster running at *localhost:2181*, name it "Local ZooKeeper" and give it id *localZK*, then he/she would set the environment variables like so:

- :code:`CONNECTION_localZK_NAME` = **Local ZooKeeper**
- :code:`CONNECTION_localZK_CONN` = **localhost:2181**

Adding auth entry to a Preset Connection
----------------------------------------

Similarly, one can add auth entry to any Preset Connection.

Each auth entry also has to have a unique id (unique constraint only applies for auth entries for the same connection). To add auth entry you need to set these environment variables:

- :code:`CONNECTION_<ID>_AUTH_<AUTHID>_SCHEME`
- :code:`CONNECTION_<ID>_AUTH_<AUTHID>_ID`
