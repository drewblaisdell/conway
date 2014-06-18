define(['grid'], function(Grid) {
  var Game = function(app) {
    this.app = app;

    this.generation = 0;

    this.nextTick = +new Date;
    this.gameStart = +new Date;
    this.updating = false;
  };

  Game.prototype.canPlaceLiveCells = function(cells) {
    var i,
      l = cells.length;

    for (i = 0; i < l; i++) {
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
    var now = +new Date;
    return (now >= this.nextTick);
  };

  Game.prototype.tick = function() {
    this.generation += 1;
    this.grid.setNextGeneration();
    this.grid.tick();

    this.nextTick += this.app.config.generationDuration;
  };

  return Game;
});