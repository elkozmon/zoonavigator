---
title: Features
category: overview
order: 1
---

The main goal of this project is to provide a way to efficiently manage ZNodes.  
This is a brief summary of what you get:

* ZNode mass delete, copy & paste and move operations
* ZNode ACL management with support for recursive changes
* ZNode data validation, syntax highlighting and auto-formatting
* ZNode regex search tool (currently limited to children ZNodes)
* SASL and Auth scheme authentication

#### Auto connect

Single instance of ZooNavigator is capable of connecting to any ZooKeeper server
by giving it the corresponding address. However, if you want it to only connect
to single ZooKeeper server you can preconfigure an address and ZooNavigator will skip the
connect form and take the user directly to editor interface.

For more info on how to enable this feature in see [Administration section]({{site.baseurl}}/administration/web-docker-options).

#### Temporary connections

All connections to ZooKeeper are short lived. By default every connection is closed after 5 seconds of inactivity. This keeps number of active connections low, even when used by more users at once.
