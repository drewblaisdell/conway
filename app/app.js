define(['core/game', 'core/playermanager', 'gameserver'], function(Game, PlayerManager, GameServer) {
  var App = function(config, fs, io) {
    this.config = config;
    this.fs = fs;
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

    // create files/directories for saving content
    this._createDataFiles();

    this._loadState();
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

        _this._saveState();
      }
    
      _this.run();
    }, 1000 / 30);
  };

  App.prototype.getServerState = function() {
    var state = this.getState();

    state.tokens = this.gameServer.getTokens();

    return state;
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

    // remove offline players that aren't on the board
    players = players.filter(function(player) {
      if (player.isOnline || player.cellsOnGrid > 0 || player.highScore > 50) {
        return true;
      } else {
        return false;
      }
    });

    return {
      livingCells: livingCells,
      players: players,
      generation: generation,
      timeBeforeTick: timeBeforeTick
    };
  };

  App.prototype.updateServerState = function(state) {
    this.updateState(state);

    this.gameServer.setTokens(state.tokens);
  };

  App.prototype.updateState = function(state) {
    this.game.generation = state.generation;
    this.game.nextTick = Date.now() + state.timeBeforeTick;
    this.game.grid.setLivingCells(state.livingCells);
    this.playerManager.updatePlayers(state.players);
  };

  App.prototype._createDataFiles = function() {
    // make directory db or ensure that it exists
    try {
      this.fs.mkdirSync('db', 0744);
    } catch(err) {
      if (err.code !== 'EEXIST') {
        console.log(err.code);
      }
    }

    // at this point, we will assume db exists
    // create last_state if it doesn't exist
    if (!this.fs.existsSync('db/last_state')) {
      this.fs.writeFileSync('db/last_state', '');
    }
  };

  App.prototype._loadState = function() {
    var lastStateData = this.fs.readFileSync('db/last_state', 'utf-8'),
      lastState;

    if (lastStateData.length > 0) {
      lastState = JSON.parse(lastStateData);

      this.updateServerState(lastState);
    }
  };

  App.prototype._saveState = function() {
    this.fs.writeFileSync('db/last_state', JSON.stringify(this.getServerState()));
  };

  return App;
});