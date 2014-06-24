define(['socket.io'], function(io) {
  var GameClient = function(app, game, playerManager) {
    this.app = app;
    this.game = game;
    this.playerManager = playerManager;
    this.config = app.config;

    this.updating = false;
  };

  GameClient.prototype.init = function(callback) {
    var _this = this;

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
  };

  GameClient.prototype._requestState = function() {
    console.log('--- OUT OF SYNC ---');

    this.socket.emit('request_state', this.playerManager.getLocalPlayer().id);
  };

  GameClient.prototype._testStateSync = function(serverCellCount) {
    var localCellCount = this.game.grid.getLivingCellCount();

    if (serverCellCount !== localCellCount) {
      this._requestState();
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