define(['core/grid'], function(Grid) {
  var Game = function(app) {
    this.app = app;
    this.config = app.config;
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

  Game.prototype.giveNewCells = function() {
    var players = this.playerManager.getPlayers();

    for (var i = 0; i < players.length; i++) {
      // give each player another cell if they don't already have the max
      if (players[i].cells < this.config.cellsPerPlayer) {
        players[i].cells++;
      }
    }
  };

  Game.prototype.init = function(width, height) {
    this.grid = new Grid(this.app);
    this.grid.init(width, height);
  };

  Game.prototype.isTimeToGiveNewCells = function() {
    return this.generation % this.config.giveCellsEvery === 0;
  };

  Game.prototype.isTimeToTick = function() {
    var now = Date.now();
    return (now >= this.nextTick);
  };

  Game.prototype.isBehindOnTicks = function() {
    var now = Date.now();

    return ((now - this.nextTick) > this.config.generationDuration);
  };

  Game.prototype.percentageOfTick = function() {
    return ((this.app.config.generationDuration - this.timeBeforeTick()) / this.app.config.generationDuration);
  };

  Game.prototype.placeCells = function(player, cells) {
    for (var i = 0; i < cells.length; i++) {
      var cell = this.grid.getCell(cells[i].x, cells[i].y);
      
      if (!cell) {
        return false;
      }

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
      players = this.playerManager.getPlayers(),
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
    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      if (playerCells[player.id]) {
        player.setCellsOnGrid(playerCells[player.id]);

        this.playerStats.push({
          id: player.id,
          name: player.name,
          color: player.color,
          cellsOnGrid: player.cellsOnGrid
        });
      } else {
        player.setCellsOnGrid(0);
      }
    }
  };

  return Game;
});