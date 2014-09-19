requirejs.config({
  baseUrl: 'js'
});

require(['app', 'config'], function(App, Config) {
  var app = new App(Config);

  app.init(Config.gridWidth, Config.gridHeight);

  // for testing, remove before production
  window.app = app;
});