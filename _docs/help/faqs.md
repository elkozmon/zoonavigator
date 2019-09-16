---
title: Frequently Asked Questions
category: help
order: 1
---

1. [What should I fill in for Auth username and Auth password?](#what-should-i-fill-in-for-auth-username-and-auth-password)
2. [How to enable Basic Authentication](#how-to-enable-basic-authentication)
3. [I'm getting error that says "Unable to establish connection with ZooKeeper."](#im-getting-error-that-says-unable-to-establish-connection-with-zookeeper)

---

##### What should I fill in for Auth username and Auth password?

Auth username and password are optional, so feel free to leave those empty. Every username & password pair entered (you can enter many) serves as an extra ACL identity, so ZNodes can be given some permissions only for users logged in with certain credentials.

---

##### How to enable Basic Authentication?

At the moment there is no configuration option to enable Basic Auth out-of-the-box. However, you are still left with two options.


The first one and also the simplest is to place a proxy which supports Basic Auth in front of ZooNavigator. For example [Traefik](https://docs.traefik.io).


The other one is to customize the ZooNavigator Docker image. It uses Nginx to serve the content so it is possible to mount custom Nginx configuration file with Basic Auth enabled. However, to support configuration via environment variables, Go template of Nginx configuration located at ``/etc/nginx/nginx.conf.template`` is used to generate the final Nginx config so make sure you don't mount your custom config to ``/etc/nginx/nginx.conf`` as it would get overwritten. If you decide to go down this path, I suggest copying the Nginx config template using ``docker run --rm elkozmon/zoonavigator-web:x.y.z cat /etc/nginx/nginx.conf.template > nginx.conf.template`` and then after you have made your changes remount that file to the original location.

As a side note, you might also consider using ACLs to secure your ZooKeeper cluster.

---

##### I'm getting error that says "Unable to establish connection with ZooKeeper."

Make sure that ZooNavigator can access the ZooKeeper host(s) in the connection string you entered in the connect form. Especially in case when running ZooNavigator in Docker, since by default it runs on bridged networking mode.
