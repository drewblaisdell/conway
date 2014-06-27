define([], function() {
  var Player = function(id, color, cells) {
    this.id = id;
    this.color = color;
    this.cells = cells;
  };

  Player.prototype.setColor = function(color) {
    this.color = color;
  };

  Player.prototype.setSocket = function(socket) {
    this.socket = socket;
  };

  Player.prototype.getSocket = function() {
    return this.socket;
  };

  return Player;
});