define([], function() {
  var Leaderboard = function(app) {
    this.app = app;
    this.config = app.config;
    this.game = app.game;
    this.playerManager = app.playerManager;
    this.playerStats = app.game.playerStats;
  };

  Leaderboard.prototype.init = function() {
    this.el = document.getElementById('leaderboard');
  };

  Leaderboard.prototype.render = function() {
    var playerStats = this.game.getPlayerStats(),
      html = '';

    playerStats.sort(function(a, b) {
      return b.cellsOnGrid - a.cellsOnGrid;
    });

    for (var i = 0; i < playerStats.length; i++) {
      var stat = playerStats[i];

      html += '<div><div class="color" style="background: ' + stat.color + ';"></div>';
      html += '<span class="name">' + stat.name + '</span>';
      html += '<div class="cells">' + stat.cellsOnGrid + '</div></div>';
    }

    this.el.innerHTML = html;
  };

  return Leaderboard;
});