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

    this.socket.on('connections', function(msg) {
      console.log(msg);
    });
  };

  GameClient.prototype._handleCellsPlaced = function(msg) {
    var cells = msg;

    this.game.placeCells(this.playerManager.localPlayer, cells);
  };

  GameClient.prototype._handleInitialState = function(msg) {
    var newPlayer = this.playerManager.createNewPlayer(msg.newPlayer.id, msg.newPlayer.color);
    this.playerManager.setLocalPlayer(newPlayer);
    this.app.updateState(msg);
  };

  GameClient.prototype._handleState = function(msg) {
    this.app.updateState(msg);
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