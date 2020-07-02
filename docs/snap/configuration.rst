=============
Configuration
=============

ZooNavigator exposes Snap configuration options that could be split into three groups:

* `ZooNavigator`_ - configures ZooNavigator and the web server
* `ZooKeeper client`_ - configuration related to ZooKeeper
* `Java`_ - configures the Java Virtual Machine

----

************
ZooNavigator
************

zoonavigator.server.http.port
-----------------------------
*default*: :code:`9000`  

Tells the HTTP server which port to bind to.
To disable HTTP set this option to ``disabled``.


zoonavigator.server.https.port
------------------------------
If set, HTTPS server will bind to this port.


zoonavigator.server.https.key-store.path
----------------------------------------
The path to the keystore containing the private key and certificate, if not provided generates a keystore for you.


zoonavigator.server.https.key-store.password
--------------------------------------------
The password to the keystore, **defaults to a blank password**.


zoonavigator.server.https.key-store.type
----------------------------------------
*default*: :code:`JKS`

The key store type.


zoonavigator.secret-key
-----------------------
Secret key for Play Framework - used for signing session cookies and CSRF tokens.  
Defaults to 64 random characters generated from */dev/urandom*.


zoonavigator.base-href
----------------------
*default*: :code:`/`

Sets base URL where ZooNavigator will be served.
If you want ZooNavigator to be available at 'http://www.your-domain.com/zoonavigator' instead of 'http://www.your-domain.com' set this option to `/zoonavigator`.


zoonavigator.request.timeout
----------------------------
*default*: :code:`10000`

Sets timeout for ZooNavigator requests.
This value is in milliseconds.


zoonavigator.request.max-size
-----------------------------
*default*: :code:`10000`

Sets maximum request size. Important for large ZNode imports.
This value is in kilobytes.


zoonavigator.connection.<MYZK>.name
-----------------------------------
Optional name for preset ZooKeeper connection *'<MYZK>'*


zoonavigator.connection.<MYZK>.connection-string
------------------------------------------------
Connection string for preset ZooKeeper connection *'<MYZK>'*


zoonavigator.connection.<MYZK>.auth.<MYAUTH>.scheme
---------------------------------------------------
Auth scheme for auth entry *'<MYAUTH>'* for preset ZooKeeper connection *'<MYZK>'*


zoonavigator.connection.<MYZK>.auth.<MYAUTH>.id
-----------------------------------------------
Auth id for auth entry *'<MYAUTH>'* for preset ZooKeeper connection *'<MYZK>'*


zoonavigator.auto-connect.connection-id
--------------------------
If set, enables :doc:`Auto Connect <autoconnect>` feature.

Set to :code:`MYZK` to automatically connect to connection defined by :code:`zoonavigator.connection.MYZK.connection-string` configuration option.

----

****************
ZooKeeper client
****************

zookeeper.client.max-age
------------------------
*default*: :code:`5000`
  
Sets inactivity timeout for ZooKeeper client. If user doesn't make any request during this period ZooKeeper connection will be closed and recreated for the future request if any.  
**Note that user does not get logged out unlike in event of session timeout.**  
This value is in milliseconds.


zookeeper.client.connect-timeout
--------------------------------
*default*: :code:`5000`

Sets timeout for attempt to establish connection with ZooKeeper.  
This value is in milliseconds.


zookeeper.sasl.client.enabled
-----------------------------
*default*: :code:`true`  

Set the value to ``false`` to disable SASL authentication.


zookeeper.sasl.client.config
----------------------------
*default*: :code:`Client`  

Specifies the context key in the JAAS login file.


zookeeper.sasl.client.username
------------------------------
*default*: :code:`zookeeper`

Specifies the primary part of the server principal. `Learn more here <https://zookeeper.apache.org/doc/r3.5.2-alpha/zookeeperProgrammers.html#sc_java_client_configuration>`_.


zookeeper.server.realm
----------------------
Realm part of the server principal.  

**By default it is the client principal realm**.


zookeeper.client.secure
-----------------------
If you want to connect to the server secure client port, you need to set this property to ``true``.
This will connect to server using SSL with specified credentials.  


zookeeper.ssl.key-store.location
--------------------------------
Specifies the file path to a JKS containing the local credentials to be used for SSL connections.


zookeeper.ssl.key-store.password
--------------------------------
Specifies the password to a JKS containing the local credentials to be used for SSL connections.


zookeeper.ssl.trust-store.location
----------------------------------
Specifies the file path to a JKS containing the remote credentials to be used for SSL connections.


zookeeper.ssl.trust-store.password
----------------------------------
Specifies the password to a JKS containing the remote credentials to be used for SSL connections.

----

****
Java
****

java.xmx
--------
Sets initial Java heap size.
This value is in bytes if no unit is specified.


java.xms
--------
Sets maximum Java heap size.
This value is in bytes if no unit is specified.


java.security.auth.login.config
-------------------------------
Path to JAAS login configuration file to use.


java.security.krb5.debug
------------------------
If set to ``true``, enables debugging mode and detailed logging for Kerberos.


java.security.krb5.realm
------------------------
Sets the default Kerberos realm.


java.security.krb5.kdc
----------------------
Sets the default Kerberos KDC.
