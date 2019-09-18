---
title: Auto connect
category: advanced
order: 1
---

Auto connect lets you skip the <a href="{{site.baseurl}}/images/screenshots/connect-form.png">Connect form</a> where you enter ZooKeeper server address and throws you directly into the <a href="{{site.baseurl}}/images/screenshots/znode-data-editor.png">Editor UI</a>. This is useful when you only have a single ZooKeeper cluster.

To enable this feature simply add these environment variables to ZooNavigator's Web Docker container:

- `AUTO_CONNECT_CONNECTION_STRING`
- `AUTO_CONNECT_AUTH_INFO` (this is optional)

See [Docker options]({{site.baseurl}}/advanced/docker-options) for description on these environment variables.
