define(['app', 'config'], function(App, Config) {
  var Conway = function(io) {
    this.app = new App(Config, io);

    this.app.init(Config.gridWidth, Config.gridHeight);

    this.app.run();
  }

  return Conway;
});