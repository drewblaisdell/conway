define(['app', 'config'], function(App, Config) {
  var Conway = function(io) {
    this.app = new App(Config, io);

    this.app.init(120, 60);

    this.app.run();
  }

  return Conway;
});