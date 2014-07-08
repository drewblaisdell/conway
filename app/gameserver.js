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

  GameServer.prototype.sendStateToSocket = function(socket) {
    socket.emit('state', this.app.getState());
  };

  GameServer.prototype._handleConnect = function(socket) {
    var initialState = this.app.getState();
    initialState.newPlayer = this.playerManager.createNewPlayer();

    this.sockets[initialState.newPlayer.id] = socket;

    socket.on('disconnect', this._handleDisconnect.bind(this));
    socket.on('place_live_cells', this._handlePlaceLiveCells.bind(this));
    socket.on('request_state', this._handleStateRequest.bind(this));

    socket.emit('initial_state', initialState);

    socket.broadcast.emit('new_player', {
      cellCount: this.game.grid.getLivingCellCount(),
      player: initialState.newPlayer.transmission()
    });

  };

  GameServer.prototype._handleDisconnect = function(socket) {
    console.log(socket);
    // console.log("UHH" + this.sockets.indexOf(socket));
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

  GameServer.prototype._handleStateRequest = function(msg) {
    var playerId = msg,
      socket = this.getSocket(playerId);
// TODO: rate-limit this endpoint
console.log("sending state to out of sync client");
    this.sendStateToSocket(socket);
  };

  return GameServer;
});