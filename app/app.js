define(['game', 'playermanager'], function(Game, PlayerManager) {
  var App = function(config) {
    this.config = config;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);

    this.playerManager = new PlayerManager(this);
  };

  App.prototype.run = function() {
    var _this = this;

    setTimeout(function() {
      if (_this.game.isTimeToTick()) {
        _this.game.tick();
      }
    
      _this.run();
    }, 1000 / 30);
  };

  return App;
});