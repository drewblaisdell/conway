requirejs.config({
  baseUrl: 'js',
  paths: {
    'jquery': 'lib/jquery.min'
  }
});

require(['app', 'config', 'jquery'], function(App, Config, $) {
  var app = new App(Config);

  app.init(120, 60);
});