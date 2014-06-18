define(['app', 'config'], function(App, Config) {
  var app = new App(Config);

  app.init(120, 60);

  app.run();

  return app;
});