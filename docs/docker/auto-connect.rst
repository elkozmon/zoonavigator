============
Auto connect
============

Auto connect lets you skip the `Connect form <../_static/images/screenshots/connect-form.png>`_ where you enter ZooKeeper server address and throws you directly into the `Editor UI <../_static/images/screenshots/znode-data-editor.png>`_. This is useful when you only have a single ZooKeeper cluster.

To enable this feature simply add these environment variables to ZooNavigator's Web Docker container:

- :code:`AUTO_CONNECT_CONNECTION_STRING`
- :code:`AUTO_CONNECT_AUTH_INFO` (this is optional)

See :doc:`Configuration <configuration>` for description on these environment variables.
