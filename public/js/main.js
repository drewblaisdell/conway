requirejs.config({
  baseUrl: 'js',
});

require(['app', 'config'], function(App, Config) {
  var app = new App(Config);

  app.init(94, 70);

  app.run();
});