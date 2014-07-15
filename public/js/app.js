define(['game', 'renderer', 'gameclient', 'playermanager'], function(Game, Renderer, GameClient, PlayerManager) {
  var App = function(config) {
    this.config = config;
  };

  App.prototype.init = function(width, height) {
    var token,
      _this = this;

    this.width = width;
    this.height = height;

    this.playing = false;

    this.playerManager = new PlayerManager(this);

    this.game = new Game(this);
    this.game.init(width, height);

    this.gameClient = new GameClient(this, this.game, this.playerManager);

    this.renderer = new Renderer(this);
    this.renderer.init();

    this.gameClient.init(function() {
      token = _this.getToken()
      if (token) {
        _this.gameClient.requestPlayer(token);
      }

      _this.game.updatePlayerStats();
      _this.renderer.updateControls();
      _this.renderer.updateLeaderboard();
      _this.renderer.updatePlayersOnline();
      _this.run();
    });
  };

  App.prototype.run = function() {
    var _this = this;

    // "the loop"
    requestAnimationFrame(function() {
      // go to next generation
      if (_this.game.isTimeToTick()) {
        _this.game.tick();
        _this.game.updatePlayerStats();
        _this.renderer.updateControls();
        _this.renderer.updateLeaderboard();
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

  App.prototype.isPlaying = function() {
    return this.playing;
  };

  App.prototype.setPlaying = function(playing) {
    this.playing = playing;

    this.renderer.updateControls();
    this.renderer.setAccentColor(this.playerManager.getLocalPlayer().color);
  };

  App.prototype.setToken = function(token) {
    localStorage.setItem('token', token);
    return token;
  };

  App.prototype.getToken = function() {
    var token = localStorage.getItem('token');
    return (token) ? token : false;
  };

  App.prototype.updateState = function(state) {
    this.game.generation = state.generation;
    this.game.nextTick = Date.now() + state.timeBeforeTick;
    this.game.grid.setLivingCells(state.livingCells);
    this.playerManager.updatePlayers(state.players);
  };

  return App;
});