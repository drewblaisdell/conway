define([], function() {
  var Player = function(id, name, color, cells, online, highScore, lastSeen) {
    this.id = id;
    this.name = name;
    this.color = color.replace('-','');
    this.cells = cells;
    this.dirty = true;
    this.cellsOnGrid = 0;
    this.highScore = highScore || 0;
    this.online = online || false;
    this.lastSeen = lastSeen || Date.now();
    this.token = false;
    this.ip = false;
  };

  Player.prototype.getIP = function() {
    return this.ip;
  };

  Player.prototype.getLastSeen = function() {
    return this.lastSeen;
  };

  Player.prototype.getSocket = function() {
    return this.socket;
  };

  Player.prototype.getToken = function() {
    return this.token || false;
  };

  Player.prototype.setToken = function(token) {
    this.token = token;
  }

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
    this.color = color.replace('-','');
  };

  Player.prototype.setDirty = function() {
    this.dirty = true;
  };

  Player.prototype.setHighScore = function(score) {
    this.highScore = score;
  };

  Player.prototype.setIP = function(ip) {
    if (typeof ip === 'string') {
      this.ip = ip;
    }
  }

  Player.prototype.setLastSeen = function(when) {
    this.lastSeen = when || Date.now();
  };

  Player.prototype.setSocket = function(socket) {
    this.socket = socket;
  };

  Player.prototype.setOnline = function(online) {
    this.online = online;

    if (online) {
      this.setLastSeen(Date.now());
    }
  };

  // returns an object representing the player, to use
  // when communicating between client/server
  Player.prototype.transmission = function() {
    return {
      id: this.id,
      name: this.name,
      color: this.color.replace('-',''),
      cells: this.cells,
      cellsOnGrid: this.cellsOnGrid,
      highScore: this.highScore,
      online: this.online,
      lastSeen: this.lastSeen
    };
  };

  return Player;
});
