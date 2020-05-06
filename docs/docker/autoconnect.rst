============
Auto Connect
============

Auto connect is a feature that lets you skip the `Connect form <../_static/images/screenshots/connect-form.png>`_ where you enter ZooKeeper server address and throws you directly into the `Editor UI <../_static/images/screenshots/znode-data-editor.png>`_. This is useful when you only have a single (or preferred) ZooKeeper cluster.

To enable this feature, first add the ZooKeeper cluster you want to use as a :doc:`Preset Connection <preset-connections>` to ZooNavigator.

Then simply set the :code:`AUTO_CONNECT_CONNECTION_ID` environment variable to the id of that preset connection.

For example, if you added your ZooKeeper cluster using :code:`CONNECTION_MYZK_CONN` environment variable, then you would set :code:`AUTO_CONNECT_CONNECTION_ID` to :code:`MYZK`.

That's it. When you open up ZooNavigator, it will automatically connect to your ZooKeeper cluster.
