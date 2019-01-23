---
title: "Web Docker options"
category: administration
order: 2
---

ZooNavigator's Docker images are configured using **environment variables**.  

---

##### WEB_HTTP_PORT
*default:* ``8000``,
*available since:* ``0.5.0``,
*replaces:* ``SERVER_HTTP_PORT``  
Tells the HTTP server which port to bind to.


##### API_HOST
*default:* ``api``  
Specifies the host where ZooNavigator API runs.


##### API_PORT
*default:* ``9000``  
Specifies the port where ZooNavigator API runs.


##### API_REQUEST_TIMEOUT_MILLIS
*default:* ``10000``  
Sets the timeout on requests to the ZooNavigator API.  
This value is in milliseconds.


##### ENABLE_IPV6
If set to ``true``, tells web server to bind to all IPv6 addresses.


##### AUTO_CONNECT_CONNECTION_STRING
*available since:* ``0.3.0``  
If set, ZooNavigator will use this value as a default connection string and skip
the connect form, automatically connecting to listed ZooKeeper servers.


##### AUTO_CONNECT_AUTH_INFO
*available since:* ``0.3.0``  
In addition to presetting connection string as explained above, you can also
set [Auth info]({{site.baseurl}}/help/faqs/#what-should-i-fill-in-for-auth-username-and-auth-password) which ZooNavigator will use to authenticate with ZooKeeper
during the auto-connect.  
**Use semicolon (;) to separate multiple entries.**
