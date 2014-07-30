define([], function() {
  var PlayersOnline = function(app) {
    this.app = app;
    this.config = app.config;
    this.playerManager = app.playerManager;
  };

  PlayersOnline.prototype.init = function() {
    this.el = document.getElementById('players-online');
  };

  PlayersOnline.prototype.render = function() {
    var html = '',
      online = this.playerManager.getOnlinePlayers();

    for (var i = 0; i < online.length; i++) {
      var player = online[i];

      html += '<div><div class="color" style="background: ' + player.color + ';"></div>';
      html += '<span class="name">' + player.name + '</span>';
      html += '<div class="cells">' + player.cellsOnGrid + '</div></div>';
    }

    this.el.innerHTML = html;
  };

  return PlayersOnline;
});