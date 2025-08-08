const PROXY_CONFIG = {
  "/api": {
    "target": `http://${process.env.API_HOST || "localhost"}:${process.env.API_PORT || 9000}`,
    "secure": false
  }
};

module.exports = PROXY_CONFIG;
