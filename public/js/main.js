requirejs.config({
  baseUrl: 'js',
});

require(['app'], function(App) {
  var app = new App();

  app.init(94, 70);

  app.run();
});