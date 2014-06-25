requirejs.config({
  baseUrl: 'js',
  paths: {
    'jquery': 'lib/jquery.min',
    'socket.io': 'https://cdn.socket.io/socket.io-1.0.4'
  }
});

require(['app', 'config', 'jquery'], function(App, Config, $) {
  var app = new App(Config);

  app.init(Config.gridWidth, Config.gridHeight);

  // for testing, remove before production
  window.app = app;
});