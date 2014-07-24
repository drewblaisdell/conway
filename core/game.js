define(['core/grid'], function(Grid) {
  var Game = function(app) {
    this.app = app;
    this.playerManager = app.playerManager;

    this.generation = 0;
    this.playerStats = [];

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

  Game.prototype.getCellCountByPlayer = function(playerId) {
    return this.grid.getCellCountByPlayer(playerId);
  };

  Game.prototype.getPlayerStats = function() {
    return this.playerStats;
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

  Game.prototype.updatePlayerStats = function() {
    var cells = this.grid.getCells(),
      playerIds,
      playerCells = {};

    for (var i = 0; i < cells.length; i++) {
      if (cells[i].playerId) {
        if (playerCells[cells[i].playerId]) {
          playerCells[cells[i].playerId]++;
        } else {
          playerCells[cells[i].playerId] = 1;
        }
      }
    }

    this.playerStats = [];
    playerIds = Object.keys(playerCells).map(parseFloat);
    for (var i = 0; i < playerIds.length; i++) {
      var player = this.playerManager.getPlayer(playerIds[i]);

      player.cellsOnGrid = playerCells[playerIds[i]];

      this.playerStats.push({
        id: player.id,
        name: player.name,
        color: player.color,
        cellsOnGrid: player.cellsOnGrid
      });
    }
  };

  return Game;
});