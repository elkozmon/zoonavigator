const PROXY_CONFIG = {
  "/api": {
    "target": `http://localhost:${process.env.API_PORT || 9000}`,
    "secure": false
  }
};

module.exports = PROXY_CONFIG;
