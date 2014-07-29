define(['app', 'config'], function(App, Config) {
  var Conway = function(fs, io) {
    this.app = new App(Config, fs, io);

    this.app.init(Config.gridWidth, Config.gridHeight);

    this.app.run();
  }

  return Conway;
});