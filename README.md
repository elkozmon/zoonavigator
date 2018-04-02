ZooNavigator
============

![Current version - 0.4.0](https://img.shields.io/badge/version-0.4.0-blue.svg)

ZooNavigator is web-based GUI for ZooKeeper with cool features.

Compatible with ZooKeeper 3.4.x and ZooKeeper 3.5.x.

Table of Contents
-----------------

  * [Features](#features)
  * [Usage](#usage)
     * [Via Docker Compose (recommended)](#via-docker-compose-recommended)
     * [Via Docker](#via-docker)
     * [From source (development only)](#from-source-development-only)
  * [Screenshots](#screenshots)
  * [Troubleshooting](#troubleshooting)
  * [Credits](#credits)
  * [License](#license)
      
Features
--------

- Auth scheme authentication
- Recursive ACL update
- Recursive ZNode mass delete
- ZNode move & duplicate
- ZNode regex search tool
- ZNode ACL management
- ZNode data validation, syntax highlighting and auto-formatting

### Auto connect

Use preconfigured connection string and auth info in order to skip connect form and go directly to editor interface. 
For more info on how to enable this feature in Docker see [configuration section](https://hub.docker.com/r/elkozmon/zoonavigator-web/).

### Temporary connections

All connections to ZooKeeper are short lived. By default every connection is closed after 5 seconds of inactivity. This keeps number of simultaneous connections low, even when used by more users at once.

Usage
-----

### Via Docker Compose (recommended)

1. Create `docker-compose.yml` file like the one below somewhere on your file system.
```yaml
version: '2.1'

services:
  web:
    image: elkozmon/zoonavigator-web:latest
    container_name: zoonavigator-web
    ports:
     - "8000:8000"
    environment:
      API_HOST: "api"
      API_PORT: 9000
    links:
     - api
    depends_on:
     - api
    restart: always
  api:
    image: elkozmon/zoonavigator-api:latest
    container_name: zoonavigator-api
    environment:
      SERVER_HTTP_PORT: 9000
    restart: always
```
2. Run `docker-compose -f /path/to/docker-compose.yml up -d`. 
3. Navigate to `http://localhost:8000` in your browser and enjoy.

To change the default configuration, edit the environment variables in Docker Compose file. 

See DockerHub repositories for configuration options.

- [ZooNavigator API](https://hub.docker.com/r/elkozmon/zoonavigator-api/)
- [ZooNavigator Web](https://hub.docker.com/r/elkozmon/zoonavigator-web/)

### Via Docker

1. Run [ZooNavigator API](https://hub.docker.com/r/elkozmon/zoonavigator-api/) server.
```docker
docker run -d \
    --env SERVER_HTTP_PORT=9000 \
    --name zoonavigator-api \
    elkozmon/zoonavigator-api:latest
```
2. Run [ZooNavigator Web](https://hub.docker.com/r/elkozmon/zoonavigator-web/) client. Here you need provide information on how to connect to ZooNavigator API. The easiest way to achieve this is by linking the containers.
```docker
docker run -d \
    -p 8000:8000 \
    --env API_HOST=api \
    --env API_PORT=9000 \
    --link zoonavigator-api:api \
    --name zoonavigator-web \
    elkozmon/zoonavigator-web:latest
```
3. Navigate to `http://localhost:8000` in your browser.

See DockerHub repositories for configuration options.

- [ZooNavigator API](https://hub.docker.com/r/elkozmon/zoonavigator-api/)
- [ZooNavigator Web](https://hub.docker.com/r/elkozmon/zoonavigator-web/)

### From source (development only)

This setup requires NPM and SBT to be installed on your machine.

First run ZooNavigator API server.

1. Clone API project repository `git clone https://github.com/elkozmon/zoonavigator-api.git`
2. Go to API project root `cd zoonavigator-api`
3. Run `sbt play/run`

This starts Play server on your localhost on port 9000.

Then run ZooNavigator Web client.

1. Clone Web project repository `git clone https://github.com/elkozmon/zoonavigator-web.git`
2. Go to Web project root `cd zoonavigator-web`
3. Run `npm install`
4. Run `npm run start`

Now open `http://localhost:4200` in your browser.

Screenshots
-----------

![Connect form](/images/connect-form.png)

![ZNode data editor](/images/znode-data-editor.png)

![ZNode ACL editor](/images/znode-acl-editor.png)

![ZNode meta editor](/images/znode-meta-editor.png)

![Create ZNode dialog](/images/create-znode.png)

Troubleshooting
---------------

#### I'm getting error that says "Unable to establish connection with ZooKeeper."

Make sure that ZooNavigator API can access the ZooKeeper host(s) in the connection string you entered in the connect form. Especially in case when running **ZooNavigator in Docker**, since by default it runs on bridged networking mode.

Credits
-------

This project is written in [Play Framework](https://github.com/playframework/playframework) and [Angular Framework](https://github.com/angular/angular).

Web client UI is powered by [Teradata Covalent Platform](https://github.com/Teradata/covalent) and [Font Awesome](https://fontawesome.com/license).

License
-------

The project is licensed under Affero General Public License version 3.0 (AGPLv3).
