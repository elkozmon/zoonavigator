---
<<<<<<< HEAD
title: Welcome
---

This is the **Edition** template from [CloudCannon](http://cloudcannon.com/).
**Edition** is perfect for documenting your product, application or service.
It's populated with example content to give you some ideas.

ChatApp is a fictional chat application for sending messages and media to others.
Teams and friend groups would use ChatApp to stay up to date if it existed.

> [Sign up](http://example.com/signup) or learn more about ChatApp at [example.com](http://example.com/).

### Getting Started

Getting a message sent is quick and easy with ChatApp:

1. Sign up for an account
2. Add your friends from their email addresses
3. Type a message or send a photo

> Feel free to send us a message at [feedback@example.com](mailto:feedback@example.com) with your feedback.

### Features

Explore more of ChatApp by reading about our features:

#### Media

Send images, videos and other media to people. Sources include your computer, phone and Facebook.

#### Contact Syncing

Sync your contact list with your phone and/or Facebook contacts. Never lose your contacts between devices again!

#### Devices

ChatApp is available everywhere. Find out how to set it up on your all your devices.
=======
title: Overview
---

ZooNavigator is web-based user interface for ZooKeeper with some cool features.

### Table of Contents
1. [Compatibility](#compatibility)
2. [Features](#features)
3. [Screenshots](#screenshots)

### Compatibility

ZooKeeper versions 3.4.x and 3.5.x are currently supported.

> However, future releases will most likely drop support for 3.4.x versions in
order to allow for secure communication with ZooKeeper.

### Features

The main goal of this project is to provide users with a way to efficiently manage
ZNodes with an awesome user experience. This is a brief summary of what you get:

* ZNode ACL management with support for recursive changes
* Ability to copy & paste or move ZNode
* Mass delete of ZNodes
* ZNode data validation, syntax highlighting and auto-formatting
* Search for ZNodes via regular expression (currently limited just to children ZNodes)
* SASL and Auth scheme authentication

#### Auto connect

Single instance of ZooNavigator is capable of connecting to any ZooKeeper server
by giving it the corresponding address. However, if you want it to only connect
to single ZooKeeper server you can preconfigure an address and ZooNavigator will skip the
connect form and take the user directly to editor interface.

For more info on how to enable this feature in Docker see configuration section.

#### Temporary connections

All connections to ZooKeeper are short lived. By default every connection is closed after 5 seconds of inactivity. This keeps number of active connections low, even when used by more users at once.

### Screenshots
>>>>>>> WIP
