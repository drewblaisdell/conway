define(['grid'], function(Grid) {
  var Game = function(app) {
    this.app = app;

    this.generation = 0;

    this.nextTick = Date.now();
    this.gameStart = Date.now();
    this.updating = false;
  };

  Game.prototype.canPlaceLiveCells = function(player, cells) {
    if (cells.length > player.cells) {
      return false;
    }
    
    for (var i = 0; i < cells.length; i++) {
      var cell = this.grid.getCell(cells[i].x, cells[i].y);

      if (cell.alive) {
        return false;
      }
    }

    return true;
  };

  Game.prototype.init = function(width, height) {
    this.grid = new Grid(this.app);
    this.grid.init(width, height);
  };

  Game.prototype.isTimeToTick = function() {
    var now = Date.now();
    return (now >= this.nextTick);
  };

  Game.prototype.percentageOfTick = function() {
    return ((this.app.config.generationDuration - this.timeBeforeTick()) / this.app.config.generationDuration);
  };

  Game.prototype.placeCells = function(player, cells) {
    for (var i = 0; i < cells.length; i++) {
      var cell = this.grid.getCell(cells[i].x, cells[i].y);
      cell.set('alive', true);
      cell.set('playerId', player.id);
    }

    player.setCells(player.cells - cells.length);
  };

  Game.prototype.tick = function() {
    this.generation += 1;
    this.grid.setNextGeneration();
    this.grid.tick();

    this.nextTick += this.app.config.generationDuration;
  };

  Game.prototype.timeBeforeTick = function() {
    var now = Date.now();
    return (this.nextTick - now);
  };

  return Game;
});