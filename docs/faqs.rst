==========================
Frequently Asked Questions
==========================

.. _FaqAuthUserPass:

What should I fill in for Auth username and Auth password?
----------------------------------------------------------

Auth username and password are optional, so feel free to leave those empty. Every username & password pair entered (you can enter many) serves as an extra ACL identity, so ZNodes can be given some permissions only for users logged in with certain credentials.


How to enable Basic Authentication?
-----------------------------------

At the moment there is no configuration option to enable Basic Auth out-of-the-box. 

I suggest placing a proxy which supports Basic Auth in front of ZooNavigator. For example `Traefik <https://docs.traefik.io>`_.


How to allow cross-origin browser access?
-----------------------------------------

ZooNavigator does not allow cross-origin browser requests by default. If you intentionally serve ZooNavigator's frontend and API from different origins, configure the allowed origins explicitly with :code:`CORS_ALLOWED_ORIGINS` for Docker or :code:`zoonavigator.cors.allowed-origins` for Snap.

Only list origins you trust, and prefer placing ZooNavigator behind your own authentication proxy when exposing it outside a private network.


I'm getting error that says "Unable to establish connection with ZooKeeper."
----------------------------------------------------------------------------

ZooNavigator cannot find ZooKeeper host(s) using the connection string you entered in the connect form. 

**Windows and Mac users using ZooNavigator in Docker:**
If you're trying to access ZooKeeper running locally on host machine (not in Docker container), `follow this advice <https://github.com/elkozmon/zoonavigator/issues/40#issue-495910852>`_.
