define(['socket.io'], function(io) {
  var GameClient = function(app, game, playerManager) {
    this.app = app;
    this.game = game;
    this.playerManager = playerManager;
    this.config = app.config;

    this.outOfSync = true;
    this.hidden = false;

    this.updating = false;
  };

  GameClient.prototype.init = function(callback) {
    var _this = this;

    document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));

    this.socket = io();

    this.socket.on('initial_state', function(socket) {
      _this._handleInitialState.call(_this, socket);
      
      if (typeof callback === 'function') {
        callback();
      }
    });

    this.socket.on('state', this._handleState.bind(this));
    this.socket.on('cells_placed', this._handleCellsPlaced.bind(this));
    this.socket.on('new_player', this._handleNewPlayer.bind(this));
  };

  GameClient.prototype._handleCellsPlaced = function(msg) {
    var cells = msg.cells,
      cellCount = msg.cellCount,
      player = this.playerManager.getPlayer(msg.playerId);

    this.game.placeCells(player, cells);

    this._testStateSync(cellCount);
  };

  GameClient.prototype._handleInitialState = function(msg) {
    var newPlayer = this.playerManager.createNewPlayer(msg.newPlayer.id, msg.newPlayer.color);
    this.playerManager.setLocalPlayer(newPlayer);
    this.app.updateState(msg);
  };

  GameClient.prototype._handleNewPlayer = function(msg) {
    var newPlayer = this.playerManager.createNewPlayer(msg.player.id, msg.player.color),
      cellCount = msg.cellCount;

    console.log('Player #' + msg.player.id + ' has joined.');
  };

  GameClient.prototype._handleState = function(msg) {
    this.app.updateState(msg);
    this.outOfSync = false;
  };

  GameClient.prototype._handleVisibilityChange = function(event) {
    if (this.hidden && this.outOfSync) {
      // the page wasn't visible and is out of sync, request state
      this._requestState();
    }
    
    this.hidden = document.hidden;
  };

  GameClient.prototype._requestState = function() {
    console.log('--- REQUESTING STATE ---');
    this.socket.emit('request_state', this.playerManager.getLocalPlayer().id);
  };

  GameClient.prototype._testStateSync = function(serverCellCount) {
    var localCellCount = this.game.grid.getLivingCellCount();

    if (serverCellCount !== localCellCount) {
      this.outOfSync = true;
      console.log('--- OUT OF SYNC ---');

      if (!this.hidden) {
        // request the state if we're out of sync but visible
        this._requestState();
      }
    }
  };

  GameClient.prototype.getPlayers = function(callback) {
    var _this = this;

    $.get('/players', function(data) {
      _this.playerManager.addPlayers(data);

      if (typeof callback === 'function') {
        callback(data);
      }
    });
  };

  GameClient.prototype.placeLiveCells = function(cells, callback) {
    var _this = this,
      localPlayer = this.playerManager.getLocalPlayer(),
      msg = {
        'cells': cells,
        'playerId': localPlayer.id
      };

    this.socket.emit('place_live_cells', msg);
  };

  return GameClient;
})