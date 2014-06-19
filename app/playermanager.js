define(['player'], function(Player) {
  var PlayerManager = function(app) {
    this.app = app;
    this.config = app.config;
    this.players = [];
  };

  PlayerManager.prototype.addPlayer = function(player) {
    this.players.push(player);
    return player;
  };

  PlayerManager.prototype.createNewPlayer = function(id, color) {
    var newPlayer;

    if (id === undefined) {
      if (this.players.length > 0) {
        id = this.players[this.players.length - 1].id + 1;
      } else {
        id = 1;
      }
    }

    if (color === undefined) {
      color = this.config.defaultPlayerColor;
    }

    newPlayer = new Player(id, color);

    this.addPlayer(newPlayer);

    return newPlayer;
  };

  PlayerManager.prototype.getLocalPlayer = function() {
    return this.localPlayer;
  };

  PlayerManager.prototype.getPlayer = function(id) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      if (player.id === id) {
        return player;
      }
    }

    return false;
  };

  PlayerManager.prototype.setLocalPlayer = function(player) {
    this.localPlayer = player;
  };

  return PlayerManager;
});