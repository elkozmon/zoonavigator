=============
Configuration
=============

ZooNavigator's Docker image can be configured using **environment variables**.  

Configuration options could be split into three groups:

* `Application`_ - configures the application and a web server
* `Java`_ - configures the Java Virtual Machine
* `ZooKeeper client`_ - configuration related to ZooKeeper

----

***********
Application
***********

HTTP_PORT
---------
*default*: :code:`9000`  

Tells the HTTP server which port to bind to.
To disable HTTP set this variable to ``disabled``.


HTTPS_PORT
----------
If set, HTTPS server will bind to this port.


SSL_KEYSTORE_PATH
-----------------
The path to the keystore containing the private key and certificate, if not provided generates a keystore for you.


SSL_KEYSTORE_PASSWORD
---------------------
The password to the keystore, **defaults to a blank password**.


SSL_KEYSTORE_TYPE
-----------------
*default*: :code:`JKS`

The key store type.


SECRET_KEY
----------
Secret key for Play Framework - used for signing session cookies and CSRF tokens.  
Defaults to 64 random characters generated from */dev/urandom*.


CONNECTION_<MYZK>_NAME
-----------------------------
Name for preset ZooKeeper connection *'<MYZK>'*


.. note::

  environment variable name should consist only of uppercase letters, digits and underscores.

CONNECTION_<MYZK>_CONN
-----------------------------
Connection string for preset ZooKeeper connection *'<MYZK>'*


.. note::

  environment variable name should consist only of uppercase letters, digits and underscores.


CONNECTION_<MYZK>_AUTH_<MYAUTH>_SCHEME
---------------------------------------------
Auth scheme for auth entry *'<MYAUTH>'* for preset ZooKeeper connection *'<MYZK>'*


.. note::

  environment variable name should consist only of uppercase letters, digits and underscores.


CONNECTION_<MYZK>_AUTH_<MYAUTH>_ID
-----------------------------------------
Auth id for auth entry *'<MYAUTH>'* for preset ZooKeeper connection *'<MYZK>'*


.. note::

  environment variable name should consist only of uppercase letters, digits and underscores.


AUTO_CONNECT_CONNECTION_ID
--------------------------
If set, enables :doc:`Auto Connect <autoconnect>` feature.

Set to :code:`MYZK` to automatically connect to connection defined by these environment variables:

- :code:`CONNECTION_MYZK_NAME`
- :code:`CONNECTION_MYZK_CONN`

----

****
Java
****

JAVA_OPTS
---------
Custom Java arguments.


JAVA_XMS
--------
Sets initial Java heap size.  
This value is in bytes if no unit is specified.


JAVA_XMX
--------
Sets maximum Java heap size.  
This value is in bytes if no unit is specified.


JAVA_JAAS_LOGIN_CONFIG
----------------------
Path to JAAS login configuration file to use.


JAVA_KRB5_DEBUG
---------------
If set to ``true``, enables debugging mode and detailed logging for Kerberos.


JAVA_KRB5_REALM
---------------
Sets the default Kerberos realm.


JAVA_KRB5_KDC
-------------
Sets the default Kerberos KDC.

----

****************
ZooKeeper client
****************

ZK_CLIENT_TIMEOUT_MILLIS
------------------------
*default*: :code:`5000`
  
Sets inactivity timeout for ZooKeeper client. If user doesn't make any request during this period ZooKeeper connection will be closed and recreated for the future request if any.  
**Note that user does not get logged out unlike in event of session timeout.**  
This value is in milliseconds.


ZK_CONNECT_TIMEOUT_MILLIS
-------------------------
*default*: :code:`5000`  

Sets timeout for attempt to establish connection with ZooKeeper.  
This value is in milliseconds.


ZK_SASL_CLIENT
--------------
*default*: :code:`true`  

Set the value to ``false`` to disable SASL authentication.


ZK_SASL_CLIENT_CONFIG
---------------------
*default*: :code:`Client`  

Specifies the context key in the JAAS login file.


ZK_SASL_CLIENT_USERNAME
-----------------------
*default*: :code:`zookeeper`

Specifies the primary part of the server principal. `Learn more here <https://zookeeper.apache.org/doc/r3.5.2-alpha/zookeeperProgrammers.html#sc_java_client_configuration>`_.


ZK_SERVER_REALM
---------------
Realm part of the server principal.  

**By default it is the client principal realm**.


ZK_CLIENT_SECURE
----------------
If you want to connect to the server secure client port, you need to set this property to ``true``.
This will connect to server using SSL with specified credentials.  

**Note that it requires using the Netty client**.


ZK_CLIENT_CNXN_SOCKET
---------------------
*default*: :code:`org.apache.zookeeper.ClientCnxnSocketNIO`  

Specifies which ClientCnxnSocket to be used. If you want to connect to server's secure client port, you need to set this property to :``org.apache.zookeeper.ClientCnxnSocketNetty``.


ZK_SSL_KEYSTORE_PATH
--------------------
Specifies the file path to a JKS containing the local credentials to be used for SSL connections.


ZK_SSL_KEYSTORE_PASSWORD
------------------------
Specifies the password to a JKS containing the local credentials to be used for SSL connections.


ZK_SSL_TRUSTSTORE_PATH
----------------------
Specifies the file path to a JKS containing the remote credentials to be used for SSL connections.


ZK_SSL_TRUSTSTORE_PASSWORD
--------------------------
Specifies the password to a JKS containing the remote credentials to be used for SSL connections.
