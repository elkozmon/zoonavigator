==================
Preset Connections
==================

Instead of manually entering connection string every time you open ZooNavigator, you can preset your ZooKeeper clusters when starting the Docker image and then select which cluster to connect to from the drop-down in the `Connect form <../_static/images/screenshots/connect-form.png>`_.

Adding a Preset Connection
--------------------------

Each connection must have a unique id, which is part of the environment variable name.

To add a preset connection, you must enter a valid connection string as :code:`CONNECTION_<ID>_CONN` environment variable.

Optionally, you can add a name to your preset connection using environment variable :code:`CONNECTION_<ID>_NAME` which will be displayed in the UI instead of the id.

.. note::

   Replace <ID> by any id string you choose. Keep in mind that environment variable name should consist only of uppercase letters, digits and underscores.

For example, if one wants to add a ZooKeeper cluster running at *localhost:2181*, name it "Local ZooKeeper" and give it id *LOCALZK*, then he/she would set the environment variables like so:

- :code:`CONNECTION_LOCALZK_NAME` = **Local ZooKeeper**
- :code:`CONNECTION_LOCALZK_CONN` = **localhost:2181**

Adding auth entry to a Preset Connection
----------------------------------------

Similarly, one can add auth entry to any Preset Connection.

Each auth entry also has to have a unique id (unique constraint only applies for auth entries for the same connection). To add auth entry you need to set these environment variables:

- :code:`CONNECTION_<ID>_AUTH_<AUTHID>_SCHEME`
- :code:`CONNECTION_<ID>_AUTH_<AUTHID>_ID`
