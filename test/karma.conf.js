module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    browsers: ['firefox_latest'],
    client: {
      captureConsole: true,
      mocha: { 'ui': 'tdd' }
    },
    basePath: '../',

    customLaunchers: {
      firefox_latest: {
        base: 'FirefoxNightly',
        prefs: {
          'dom.serviceWorkers.enabled': true,
          'dom.webcomponents.enabled': true
        }
      }
    },

    files: [
      'pipe.js',
      {
        pattern: 'test/sw.js',
        included: false
      },
      {
        pattern: 'test/worker.js',
        included: false
      },
      'test/test.js'
    ]
  });
};
