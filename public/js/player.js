define([], function() {
  var Player = function(id, color) {
    this.id = id;
    this.color = color;
  };

  Player.prototype.setColor = function(color) {
    this.color = color;
  };

  return Player;
});