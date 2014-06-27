define([], function() {
  var Player = function(id, color, cells) {
    this.id = id;
    this.color = color;
    this.cells = cells;
    this.dirty = true;
  };

  Player.prototype.getSocket = function() {
    return this.socket;
  };

  Player.prototype.isDirty = function() {
    return this.dirty;
  };

  Player.prototype.setCells = function(cells) {
    this.cells = cells;
  };

  Player.prototype.setClean = function() {
    this.dirty = false;
  };

  Player.prototype.setColor = function(color) {
    this.color = color;
  };

  Player.prototype.setDirty = function() {
    this.dirty = true;
  };

  Player.prototype.setSocket = function(socket) {
    this.socket = socket;
  };

  // returns an object representing the player, to use
  // when communicating between client/server
  Player.prototype.transmission = function() {
    return {
      id: this.id,
      color: this.color,
      cells: this.cells
    };
  };

  return Player;
});