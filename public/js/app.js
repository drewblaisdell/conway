define(['game', 'renderer', 'gameclient', 'playermanager'], function(Game, Renderer, GameClient, PlayerManager) {
  var App = function(config) {
    this.config = config;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);
    
    this.playerManager = new PlayerManager(this);

    this.gameClient = new GameClient(this, this.game, this.playerManager);

    this.renderer = new Renderer(this);
    this.renderer.init();

    var _this = this;

    this.gameClient.init(function() {
      _this.renderer.setAccentColor(_this.playerManager.getLocalPlayer().color);
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

      _this.renderer.renderChanges();
      _this.run();
    });

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
          color: player.color
        };
      }),
      generation = this.game.generation,
      timeBeforeTick = (game.nextTick - Date.now());

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