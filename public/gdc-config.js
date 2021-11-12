// config.js
angular.module("ngApp.config", [])
  .constant("config", {
    "version": "1.4.1",
    "commitLink": "https://github.com/NCI-GDC/portal-ui/commit/1416c89",
    "commitHash": "1416c89",
    "api": "/endpoint/",
    "auth":"/auth/",
    "auth_api": "",
    "supportedAPI": "1",
    "tag": "https://github.com/NCI-GDC/portal-ui/releases/tag/1.4.1",
    "production": false,
    "fake_auth": false,
  });