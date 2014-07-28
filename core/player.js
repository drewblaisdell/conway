define([], function() {
  var Player = function(id, name, color, cells, online, highScore) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.cells = cells;
    this.dirty = true;
    this.cellsOnGrid = 0;
    this.highScore = highScore || 0;
    this.online = online || false;
  };

  Player.prototype.getSocket = function() {
    return this.socket;
  };

  Player.prototype.isDirty = function() {
    return this.dirty;
  };

  Player.prototype.isOnline = function() {
    return this.online;
  };

  Player.prototype.setCells = function(cells) {
    this.cells = cells;
  };

  Player.prototype.setCellsOnGrid = function(cellCount) {
    this.cellsOnGrid = cellCount;

    if (this.highScore < cellCount) {
      this.highScore = cellCount;
    }
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

  Player.prototype.setHighScore = function(score) {
    this.highScore = score;
  };

  Player.prototype.setSocket = function(socket) {
    this.socket = socket;
  };

  Player.prototype.setOnline = function(online) {
    this.online = online;
  };

  // returns an object representing the player, to use
  // when communicating between client/server
  Player.prototype.transmission = function() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      cells: this.cells,
      cellsOnGrid: this.cellsOnGrid,
      highScore: this.highScore,
      online: this.online
    };
  };

  return Player;
});