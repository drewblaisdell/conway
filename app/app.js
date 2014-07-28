define(['core/game', 'core/playermanager', 'gameserver'], function(Game, PlayerManager, GameServer) {
  var App = function(config, io) {
    this.config = config;
    this.io = io;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.playerManager = new PlayerManager(this);

    this.game = new Game(this);
    this.game.init(width, height);

    this.gameServer = new GameServer(this, this.io);
    this.gameServer.init();
  };

  App.prototype.run = function() {
    var _this = this;

    setTimeout(function() {
      if (_this.game.isTimeToTick()) {
        _this.game.tick();
        _this.game.updatePlayerStats();
        
        if (_this.game.isTimeToGiveNewCells()) {
          _this.game.giveNewCells();
        }
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
        return player.transmission();
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