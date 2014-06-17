define(['grid'], function(Grid) {
  var Game = function(app) {
    this.app = app;
  };

  Game.prototype.init = function(width, height) {
    this.grid = new Grid(this.app);
    this.grid.init(width, height);
  };

  return Game;
});