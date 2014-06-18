define(['game', 'renderer', 'gameclient'], function(Game, Renderer, GameClient) {
  var App = function(config) {
    this.config = config;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);

    this.gameClient = new GameClient(this, this.game);

    this.renderer = new Renderer(this);
    this.renderer.init();

    var _this = this;
    this.gameClient.getUpdate(function(data) {
      _this.run();
    });
  };

  App.prototype.run = function() {
    var _this = this;

    // "the loop"
    requestAnimationFrame(function() {
      var now = +new Date;
    
      // go to next generation
      if (_this.game.isTimeToTick()) {
        _this.game.tick();
      }

      // get an update from the server
      if (_this.gameClient.isTimeToUpdate() && !_this.gameClient.updating) {
        _this.gameClient.getUpdate(function(data) {
        });
      }
    
      _this.renderer.renderChanges();
      _this.run();
    });

  };

  return App;
});