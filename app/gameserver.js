define([], function() {
  var GameServer = function(app, io) {
    this.app = app;
    this.game = app.game;
    this.playerManager = app.playerManager;
    this.config = app.config;
    this.io = io;
    this.sockets = {};
    this.md5 = require('MD5');
    this.tokens = {};
  };

  GameServer.prototype.getPlayerToken = function(player) {
    return this.hash(player.id + player.name + this.config.secretToken);
  };

  GameServer.prototype.hash = function(s){
    return this.md5(s);
  };

  GameServer.prototype.init = function() {
    this.nextStateUpdate = Date.now() + this.config.timeBetweenStateUpdates;
    this.io.on('connection', this._handleConnect.bind(this));
  };

  GameServer.prototype.getSocket = function(id) {
    return this.sockets[id];
  };

  GameServer.prototype.isTimeToSendState = function() {
    return (Date.now() > this.nextStateUpdate);
  };

  GameServer.prototype.sendState = function() {
    this.io.emit('state', this.app.getState());
    this.nextStateUpdate = Date.now() + this.config.timeBetweenStateUpdates;
  };

  GameServer.prototype.sendStateToSocket = function(socket) {
    socket.emit('state', this.app.getState());
  };

  GameServer.prototype._handleConnect = function(socket) {
    socket.on('request_state', this._handleStateRequest.bind(this, socket));
    socket.on('request_player', this._handleRequestPlayer.bind(this, socket));
    socket.on('request_new_player', this._handleRequestNewPlayer.bind(this, socket));

    socket.emit('state', this.app.getState());
  };

  GameServer.prototype._handleDisconnect = function(socket, player, msg) {
    player.setOnline(false);
    socket.broadcast.emit('player_disconnect', { playerId: player.id });
  };

  GameServer.prototype._handleRequestPlayer = function(socket, msg) {
    var transmission,
      token = msg['token'],
      player = this.playerManager.getPlayer(this.tokens[token]);

    if (player) {
      player.setOnline(true);
      
      transmission = player.transmission();
      socket.emit('receive_new_player', { player: transmission, token: token });

      socket.broadcast.emit('player_connect', {
        cellCount: this.game.grid.getLivingCellCount(),
        player: player.transmission()
      });

      socket.on('place_live_cells', this._handlePlaceLiveCells.bind(this));
      socket.on('disconnect', this._handleDisconnect.bind(this, socket, player));
    }
  };

  GameServer.prototype._handleRequestNewPlayer = function(socket, msg) {
    var name = msg.name,
      color = msg.color,
      player = this.playerManager.createNewPlayer(undefined, name, color),
      token = this.getPlayerToken(player);

    this.tokens[token] = player.id;

    player.setOnline(true);

    socket.emit('receive_new_player', { player: player.transmission(), token: token });

    socket.broadcast.emit('player_connect', {
      cellCount: this.game.grid.getLivingCellCount(),
      player: player.transmission()
    });

    socket.on('place_live_cells', this._handlePlaceLiveCells.bind(this));
    socket.on('disconnect', this._handleDisconnect.bind(this, socket, player));
  };

  GameServer.prototype._handlePlaceLiveCells = function(msg) {
    var cells = msg.cells,
      player = this.playerManager.getPlayer(msg.playerId);

    if (this.game.canPlaceLiveCells(player, cells)) {
      this.game.placeCells(player, cells);
      this.io.emit('cells_placed', {
        cells: cells,
        cellCount: this.game.grid.getLivingCellCount(),
        player: player
      });
    } else {

    }
  };

  GameServer.prototype._handleStateRequest = function(socket, msg) {
    var playerId = msg;
// TODO: rate-limit this endpoint
console.log("sending state to out of sync client");
    this.sendStateToSocket(socket);
  };

  return GameServer;
});