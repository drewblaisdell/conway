define([], function() {
  var Cell = function(x, y) {
    this.x = x;
    this.y = y;
    this.alive = false;
    this.dirty = true;
  };

  Cell.prototype.equals = function(c) {
    if (c !== undefined && this.x === c.x && this.y === c.y) {
      return true;
    }

    return false;
  };

  Cell.prototype.isDirty = function() {
    return this.dirty;
  };

  Cell.prototype.setDirty = function() {
    this.dirty = true;
  };

  Cell.prototype.setClean = function() {
    this.dirty = false;
  };

  Cell.prototype.set = function(k, v) {
    this[k] = v;
    this.setDirty();
  };

  Cell.prototype.setAlive = function() {
    this.set('alive', true);
  };

  Cell.prototype.tick = function() {
    this.set('alive', this.aliveNextGeneration);
    this.aliveNextGeneration = undefined;
  };

  return Cell;
});