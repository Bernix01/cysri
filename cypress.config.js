const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "wm4ysr",
  e2e: {
    setupNodeEvents(on, config) {
      return require("./node_modules/cypress-fs/plugins/index.js")(on, config);
    },
    experimentalStudio: true,
    viewportWidth: 2560,
    viewportHeight: 3440,
    trashAssetsBeforeRuns: false,
    pageLoadTimeout: 300000,
    baseUrl: "https://srienlinea.sri.gob.ec",
    chromeWebSecurity: false,
  },
});
