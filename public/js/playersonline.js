define([], function() {
  var PlayersOnline = function(app) {
    this.app = app;
    this.config = app.config;
    this.playerManager = app.playerManager;
    this.gameClient = app.gameClient;
  };

  PlayersOnline.prototype.init = function() {
    this.el = document.getElementById('players-online');
  };

  PlayersOnline.prototype.render = function() {
    var html = '',
      online = this.playerManager.getOnlinePlayers();

    online.sort(function(a, b) {
      return b.cellsOnGrid - a.cellsOnGrid;
    });

    for (var i = 0; i < online.length; i++) {
      var player = online[i];

      html += '<div data-player-id="'+ player.id +'"><div class="color" style="background: ' + player.color + ';"></div>';
      html += '<span class="name">' + player.name + '</span>';
      html += '<div class="cells">' + player.cellsOnGrid + '</div></div>';
    }

    this.el.innerHTML = html;
  };

  return PlayersOnline;
});