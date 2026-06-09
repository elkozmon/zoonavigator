========
Features
========

The main goal of this project is to provide a way to efficiently manage ZNodes.

This is a brief summary of what you get:

* **Manage multiple ZooKeeper clusters at once**
* Advanced ZNode operations
    - move, copy & paste
    - export & import
    - mass delete
    - regex search tool (currently limited to children nodes)
* Smart ZNode data editor
    - data validation, syntax highlighting and auto-formatting
    - edit binary data in base64 mode
    - edit compressed data (gzip)
* Auth & security
    - SASL and Auth scheme ZooKeeper authentication
    - ZNode ACL management (supports recursive changes)

Compatibility
-------------

ZooNavigator supports the maintained Apache ZooKeeper 3.8.x and 3.9.x release lines.
Older ZooKeeper releases may work, but they are outside the supported compatibility matrix.
