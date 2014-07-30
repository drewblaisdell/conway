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

  GameServer.prototype.getTokens = function() {
    return this.tokens;
  };

  GameServer.prototype.isTimeToSendState = function() {
    return (Date.now() > this.nextStateUpdate);
  };

  GameServer.prototype.sendState = function() {
    var state = this.app.getMinimumState();

    this.io.emit('state', state);
    this.nextStateUpdate = Date.now() + this.config.timeBetweenStateUpdates;
  };

  GameServer.prototype.sendStateToSocket = function(socket) {
    var state = this.app.getMinimumState();
    socket.emit('state', state);
  };

  GameServer.prototype.setTokens = function(tokens) {
    this.tokens = tokens;
  };

  GameServer.prototype._broadcastPlayerConnect = function(socket, player) {
    socket.broadcast.emit('player_connect', {
      cellCount: this.game.grid.getLivingCellCount(),
      player: player.transmission()
    });

    console.log(player.name, 'joined.', this.playerManager.getOnlinePlayers().length, 'player(s) online.');
  };

  GameServer.prototype._handleConnect = function(socket) {
    var state = this.app.getMinimumState();

    socket.on('request_state', this._handleStateRequest.bind(this, socket));
    socket.on('request_player', this._handleRequestPlayer.bind(this, socket));
    socket.on('request_new_player', this._handleRequestNewPlayer.bind(this, socket));

    socket.emit('state', state);
  };

  GameServer.prototype._handleDisconnect = function(socket, player, message) {
    player.setOnline(false);
    socket.broadcast.emit('player_disconnect', { playerId: player.id });

    console.log(player.name, 'left.', this.playerManager.getOnlinePlayers().length, 'player(s) online.');
  };

  GameServer.prototype._handleRequestPlayer = function(socket, message) {
    var transmission,
      token = message['token'],
      player = this.playerManager.getPlayer(this.tokens[token]);

    if (player) {
      player.setOnline(true);
      
      transmission = player.transmission();
      socket.emit('receive_new_player', { player: transmission, token: token });

      this._broadcastPlayerConnect(socket, player);

      socket.on('place_live_cells', this._handlePlaceLiveCells.bind(this));
      socket.on('disconnect', this._handleDisconnect.bind(this, socket, player));
    }
  };

  GameServer.prototype._handleRequestNewPlayer = function(socket, message) {
    var name = message.name.trim(),
      color = message.color,
      player,
      errorMessage = '',
      token;

    if (this.playerManager.getPlayerByName(name)) {
      errorMessage = 'The name ' + name + ' is already taken';
    } else if (name.length > 26) {
      errorMessage = 'Your name cannot be longer than 26 characters.';
    }

    if (errorMessage.length > 0) {
      socket.emit('new_player_error', { message: errorMessage });
      return false;
    }

    player = this.playerManager.createNewPlayer({
      name: name,
      color: color
    });
    token = this.getPlayerToken(player);

    this.tokens[token] = player.id;

    player.setOnline(true);

    socket.emit('receive_new_player', { player: player.transmission(), token: token });

    this._broadcastPlayerConnect(socket, player);

    socket.on('place_live_cells', this._handlePlaceLiveCells.bind(this));
    socket.on('disconnect', this._handleDisconnect.bind(this, socket, player));
  };

  GameServer.prototype._handlePlaceLiveCells = function(message) {
    var cells = message.cells,
      player = this.playerManager.getPlayer(message.playerId),
      token = this.getPlayerToken(player);

    if (token !== message.token) {
      return false;
    }

    player.setLastSeen(Date.now());

    if (this.game.canPlaceLiveCells(player, cells)) {
      this.game.placeCells(player, cells);
      this.io.emit('cells_placed', {
        cells: cells,
        cellCount: this.game.grid.getLivingCellCount(),
        player: player
      });
    } else {
      // do nothing for now
    }
  };

  GameServer.prototype._handleStateRequest = function(socket, message) {
    var player = this.playerManager.getPlayer(message);

    player.setOnline(true);

    this.sendStateToSocket(socket);
  };

  return GameServer;
});