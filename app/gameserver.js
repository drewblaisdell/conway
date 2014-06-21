define([], function() {
  var GameServer = function(app, io) {
    this.app = app;
    this.game = app.game;
    this.playerManager = app.playerManager;
    this.config = app.config;
    this.io = io;
    this.sockets = {};
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

  GameServer.prototype._handleConnect = function(socket) {
    var initialState = this.app.getInitialState();

    this.sockets[initialState.newPlayer.id] = socket;

    console.log('a user connected');

    socket.on('disconnect', this._handleDisconnect.bind(this));
    socket.on('place_live_cells', this._handlePlaceLiveCells.bind(this));

    socket.emit('initial_state', initialState);

    this.io.emit('connections', 'a player connected');
  };

  GameServer.prototype._handleDisconnect = function(socket) {
    console.log('user disconnected');
  };

  GameServer.prototype._handlePlaceLiveCells = function(msg) {
    var cells = msg.cells,
      player = this.playerManager.getPlayer(msg.playerId),
      socket = this.getSocket(msg.playerId);
    if (this.game.canPlaceLiveCells(player, cells)) {
      this.game.placeCells(player, cells);
      socket.emit('cells_placed', cells);
    } else {

    }
  };

  return GameServer;
});