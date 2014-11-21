define(['lib/socket.io'], function(io) {
  var GameClient = function(app, game, playerManager) {
    this.app = app;
    this.game = game;
    this.playerManager = playerManager;
    this.chatManager = app.chatManager;
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

    this.socket.on('latency', this._handleLatencyResponse.bind(this));
    this.socket.on('latency_echo', this._handleLatencyEcho.bind(this));
    this.socket.on('state', this._handleState.bind(this));
    this.socket.on('cells_placed', this._handleCellsPlaced.bind(this));
    this.socket.on('player_connect', this._handlePlayerConnect.bind(this));
    this.socket.on('receive_new_player', this._handleReceiveNewPlayer.bind(this));
    this.socket.on('player_disconnect', this._handlePlayerDisconnect.bind(this));
    this.socket.on('new_player_error', this._handleNewPlayerError.bind(this));
    this.socket.on('chat_message', this._handleChatMessage.bind(this));
  };

  GameClient.prototype.requestPlayer = function(token) {
    this.socket.emit('request_player', { token: token });
  };

  GameClient.prototype.requestNewPlayer = function(name, color) {
    name = name.trim();
    this.socket.emit('request_new_player', { 'name': name, 'color': color });
  };

  GameClient.prototype.sendChatMessage = function(message) {
    var player = this.playerManager.getLocalPlayer()
      playerId = player.id,
      token = this.app.getToken();

    this.socket.emit('chat_message', {
      message: message,
      playerId: playerId,
      token: token
    });
  };

  GameClient.prototype._handleCellsPlaced = function(message) {
    var cells = message.cells,
      cellCount = message.cellCount,
      player = this.playerManager.getPlayer(message.player.id);
    
    if (player) {
      player.setOnline(true);
    } else {
      player = this.playerManager.createNewPlayer({
        id: message.player.id,
        name: message.player.name,
        color: message.player.color,
        cells: message.player.cells,
        highScore: message.player.highScore,
        online: message.player.online,
        lastSeen: message.player.lastSeen
      });
    }

    this.game.placeCells(player, cells);
    this.game.updatePlayerStats();
    this.playerManager.updatePlayer(message.player);

    player.setLastSeen(Date.now());

    this._testStateSync(cellCount);
  };

  GameClient.prototype._handleChatMessage = function(message) {
    var player = this.playerManager.getPlayer(message.player.id);

    if (player) {
      player.setOnline(true);
    } else {
      player = this.playerManager.createNewPlayer(message.player);
    }

    this.chatManager.addMessage(player, message.message, message.timestamp);
  };

  GameClient.prototype._handleLatencyEcho = function(message) {
    this.socket.emit('latency_echo', message);
  };

  GameClient.prototype._handleLatencyResponse = function(message) {
    this.latency = message;
  };

  GameClient.prototype._handleNewPlayerError = function(message) {
    var message = message.message;

    this.app.renderer.newPlayerError(message);
  };

  GameClient.prototype._handlePlayerConnect = function(message) {
    var playerObj = message.player,
      player = this.playerManager.getPlayer(playerObj.id),
      cellCount = message.cellCount;

    if (player) {
      player.setOnline(true);
    } else {
      player = this.playerManager.createNewPlayer({
        id: playerObj.id,
        name: playerObj.name,
        color: playerObj.color,
        cells: playerObj.cells,
        highScore: playerObj.highScore,
        online: playerObj.online,
        lastSeen: playerObj.lastSeen
      });
    }

    console.log(player.name + ' has joined.');

    this._testStateSync(cellCount);
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
      player = this.playerManager.createNewPlayer({
        id: playerObj.id,
        name: playerObj.name,
        color: playerObj.color,
        cells: playerObj.cells,
        highScore: playerObj.highScore,
        online: playerObj.online,
        lastSeen: playerObj.lastSeen
      });
    }

    this.playerManager.setLocalPlayer(player);
    this.app.setToken(message.token);
    this.app.setPlaying(true);
  };

  GameClient.prototype._handleState = function(message) {
    this.app.updateState(message);
    this.outOfSync = false;

    if (typeof this.callback === 'function') {
      this.callback();

      this.callback = false;
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
    
    var player = this.playerManager.getLocalPlayer();
    if (player) {
      player.setOnline(true);
      this.socket.emit('request_state', { playerId: this.playerManager.getLocalPlayer().id });
    } else {
      // "observe mode" state request
      this.socket.emit('request_state', { playerId: "" });
    }

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
      message = {
        cells: cells,
        playerId: localPlayer.id,
        token: this.app.getToken()
      };

    this.socket.emit('place_live_cells', message);

    this.game.updatePlayerStats();
  };

  return GameClient;
})