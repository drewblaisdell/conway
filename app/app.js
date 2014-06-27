define(['game', 'playermanager', 'gameserver'], function(Game, PlayerManager, GameServer) {
  var App = function(config, io) {
    this.config = config;
    this.io = io;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);

    this.playerManager = new PlayerManager(this);

    this.gameServer = new GameServer(this, this.io);
    this.gameServer.init();
  };

  App.prototype.run = function() {
    var _this = this;

    setTimeout(function() {
      if (_this.game.isTimeToTick()) {
        _this.game.tick();
      }

      if (_this.gameServer.isTimeToSendState()) {
        // _this.gameServer.sendState();
      }
    
      _this.run();
    }, 1000 / 30);
  };

  App.prototype.getState = function() {
    var livingCells = this.game.grid.getLivingCells().map(function(cell) {
        return {
          x: cell.x,
          y: cell.y,
          alive: cell.alive,
          playerId: cell.playerId
        };
      }),
      players = this.playerManager.getPlayers().map(function(player) {
        return {
          id: player.id,
          color: player.color,
          cells: player.cells
        };
      }),
      generation = this.game.generation,
      timeBeforeTick = (this.game.nextTick - Date.now());

    return {
      livingCells: livingCells,
      players: players,
      generation: generation,
      timeBeforeTick: timeBeforeTick
    };
  };

  App.prototype.updateState = function(state) {
    this.game.generation = state.generation;
    this.game.nextTick = Date.now() + state.timeBeforeTick;
    this.game.grid.setLivingCells(state.livingCells);
    this.playerManager.updatePlayers(state.players);
  };

  return App;
});