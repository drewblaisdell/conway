define(['game'], function(Game) {
  var App = function(config) {
    this.config = config;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);

    var _this = this;
    for (var j = 0; j < 5; j++) {
      var x = Math.floor(Math.random() * 90),
        y = Math.floor(Math.random() * 60);

      _this.game.grid.getCell(x, y).setAlive();
      _this.game.grid.getCell(x + 1, y).setAlive();
      _this.game.grid.getCell(x + 2, y).setAlive();
    }
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