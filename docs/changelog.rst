==========
Change Log
==========

1.1.1
-----

*October 28, 2021*


**Changes:**

* Use custom Authorization header to allow auth in proxies

**Fixes:**

* Correctly handle HEAD HTTP requests

1.1.0
-----

*November 03, 2020*


**Features:**

* Configurable applications base URL

1.0.1
-----

*June 07, 2020*


**Fixes:**

* Custom base URL routing
* ZNode import

1.0.0
-----

*May 16, 2020*


Adds capability to manage multiple ZooKeeper clusters at once for larger deployments

**Changes:**

* Add support for preset ZooKeeper connections
* Switch between ZooKeeper clusters in Editor UI
* Change Auto connect Docker configuration
* Remove Session info dialog
* Show build version on Connect page


0.8.0
-----

*February 15, 2020*


**Changes:**

* Gzip exports (json imports are still supported)
* Enable Docker image to run under arbitrary user
* When using node filter, show non-matching nodes as semi-transparent
* Clear node filter when navigating to other node
* :code:`PUT /api/znode/data` API endpoint accepts :code:`application/json` instead of :code:`text/plain`
* Add Donation link

**Fixes:**

* Fix SSL support for ZooKeeper 3.5.x
* Fix false warnings about discarding changes


0.7.1
-----

*November 08, 2019*


Minor bug fixes.

**Changes:**

* Increase default ZNode import size limit to 10mb

**Fixes:**

* Fix :code:`BASE_HREF` Docker build argument
* Fix app freezing after session expired
* Fix Docker healthcheck when :code:`HTTP_PORT` is set to :code:`disabled`


0.7.0
-----

*September 18, 2019*


Release ZooNavigator as a single Docker image.

**Changes:**

* Single Docker image release
* Increase default session timeout to 1 hour

**Fixes:**

* Fix save button keyboard shortcut in editor


0.6.2
-----

*June 20, 2019*


Allows to run ZooNavigator API's Docker image as an unprivileged user.

**Changes:**

* Docker container set to run under user *zoonavigator-api*


0.6.1
-----

*April 13, 2019*


Allows to run ZooNavigator Web's Docker image as an unprivileged user.

**Changes:**

* Switched from official *Nginx* Docker image to *Nginxinc*


0.6.0
-----

*January 24, 2019*


Implements several feature requests and fixes minor bugs.

**Features:**

* Export & import ZNode trees
* Read & write gzip compressed ZNode data
* Base64 editor mode for editing binary data
* Custom URLs using added :code:`BASE_HREF` Dockerfile build argument

**Changes:**

* Turned off access logs on Dockers healthchecks


0.5.1
-----

*November 01, 2018*


Decreases Dockers health-check interval so it doesn't cause startup delays in tools like Docker Swarm.

**Changes:**

* Decreases Dockers health-check interval to 30 seconds


0.5.0
-----

*May 29, 2018*


Adds support for SASL authentication with ZooKeeper and HTTPS.

**Features:**

* SASL authentication with ZooKeeper
* HTTPS support

**Changes:**

* Changed editors font to Fira Code
* Base Docker images on Alpine
* Enable applying ACLs recursively without making any changes

**Fixes:**

* Prevent submitting editor via keyboard shortcut when save button is disabled


0.4.0
-----

*April 02, 2018*


Adds auto-format feature and fixes some minor bugs.

**Features:**

* Auto-format feature in editor
* Remember editor options (wrap, mode) for each ZNode
* Log ZooNavigator version on Docker startup

**Changes:**

* Editor buttons got minor polishing
* Changed editors font to DejaVu Sans Mono

**Fixes:**

* Switching editor tabs between changes (to data or acl) causes 'Bad version' error
* When session expires two 'Session lost' dialogs spawn at once


0.3.0
-----

*January 11, 2018*


Adds many new ZNode editor features.

**Features:**

* Move ZNode feature
* Duplicate ZNode feature
* Children ZNode list sorting
* Data editor text wrapping
* Address bar for manual navigation
* Auto connect feature - skip connect form and use preconfigured connection parameters
* Hotkey for submitting ZNode data changes (ctrl+s)
* JVM memory settings via environment variables (API Docker image)

**Changes:**

* UI changes, redesigned editor tabs
