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

    this.callback = callback;

    document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));

    this.socket = io();

    this.socket.on('state', this._handleState.bind(this));
    this.socket.on('cells_placed', this._handleCellsPlaced.bind(this));
    this.socket.on('player_connect', this._handlePlayerConnect.bind(this));
    this.socket.on('receive_new_player', this._handleReceiveNewPlayer.bind(this));
    this.socket.on('player_disconnect', this._handlePlayerDisconnect.bind(this));
  };

  GameClient.prototype.requestPlayer = function(token) {
    this.socket.emit('request_player', { token: token });
  };

  GameClient.prototype.requestNewPlayer = function(name, color) {
    this.socket.emit('request_new_player', { 'name': name, 'color': color });
  };

  GameClient.prototype._handleCellsPlaced = function(msg) {
    var cells = msg.cells,
      cellCount = msg.cellCount,
      player = this.playerManager.getPlayer(msg.player.id);
    
    this.game.placeCells(player, cells);
    this.playerManager.updatePlayer(msg.player);

    this._testStateSync(cellCount);
  };

  GameClient.prototype._handlePlayerConnect = function(message) {
    var playerObj = message.player,
      player = this.playerManager.getPlayer(playerObj.id);

    if (player) {
      player.setOnline(true);
    } else {
      player = this.playerManager.createNewPlayer(playerObj.id, playerObj.name, playerObj.color, playerObj.cells, playerObj.online);
    }

    console.log(player.name + ' has joined.');
  };

  GameClient.prototype._handlePlayerDisconnect = function(message) {
    var player = this.playerManager.getPlayer(message.playerId);

    player.setOnline(false);

    console.log(player.name + ' has disconnected.');
  };

  GameClient.prototype._handleReceiveNewPlayer = function(message) {
    var playerObj = message.player,
      player = this.playerManager.getPlayer(playerObj.id);

    if (player) {
      player.setOnline(true);
    } else {
      player = this.playerManager.createNewPlayer(player.id, player.name, player.color, player.cells, player.online);      
    }

    this.playerManager.setLocalPlayer(player);
    this.app.setToken(message.token);
    this.app.setPlaying(true);
  };

  GameClient.prototype._handleState = function(msg) {
    this.app.updateState(msg);
    this.outOfSync = false;

    if (typeof this.callback === 'function') {
      this.callback();
    }
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
        // request the state if the client is out of sync but the
        // window is visible
        this._requestState();
      }
    }
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