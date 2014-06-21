define(['app', 'config'], function(App, Config) {
  var Conway = function() {
    this.app = new App(Config);

    this.app.init(120, 60);

    this.app.run();
  }

  return Conway;
});