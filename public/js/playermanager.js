define(['player'], function(Player) {
  var PlayerManager = function(app) {
    this.app = app;
    this.config = app.config;
    this.players = [];
  };

  PlayerManager.prototype.addPlayer = function(player) {
    if (!this.getPlayer(player.id)) {
      this.players.push(player);
      return player;
    } else {
      return false;
    }
  };

  PlayerManager.prototype.addPlayers = function(players) {
    for (var i = 0; i < players.length; i++) {
      this.addPlayer(players[i]);
    }
  };

  PlayerManager.prototype.createNewPlayer = function(id, name, color, cells, online) {
    var newPlayer;

    if (id === undefined) {
      if (this.players.length > 0) {
        id = this.players[this.players.length - 1].id + 1;
      } else {
        id = 1;
      }
    }

    if (color === undefined) {
      // give random color for now
      var r = Math.floor(Math.random()*255),
        g = Math.floor(Math.random()*255),
        b = Math.floor(Math.random()*255);

      color = 'rgba('+ r +','+ g +','+ b +',1)';
    }

    if (name === undefined) {
      name = "No Name";
    }

    if (cells === undefined) {
      cells = this.config.cellsPerPlayer;
    }

    newPlayer = new Player(id, name, color, cells, online);

    this.addPlayer(newPlayer);

    return newPlayer;
  };

  PlayerManager.prototype.getLocalPlayer = function() {
    return this.localPlayer;
  };

  PlayerManager.prototype.getOnlinePlayers = function() {
    var onlinePlayers = [];

    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      if (player.online) {
        onlinePlayers.push(player);
      }
    }

    return onlinePlayers;
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

  PlayerManager.prototype.getPlayers = function() {
    return this.players;
  };

  PlayerManager.prototype.setLocalPlayer = function(player) {
    this.localPlayer = this.getPlayer(player.id);
  };

  PlayerManager.prototype.updatePlayer = function(player) {
    var ourPlayer = this.getPlayer(player.id);

    if (ourPlayer) {
      ourPlayer.setColor(player.color);
      ourPlayer.setCells(player.cells);
      ourPlayer.setDirty();
    } else {
      return false;
    }
  };

  PlayerManager.prototype.updatePlayers = function(players) {
    for (var i = 0; i < players.length; i++) {
      if (!(players[i] instanceof Player)) {
        // this lets the method handle an array of players
        // or an array of objects representing players
        players[i] = new Player(players[i].id, players[i].name, players[i].color, players[i].cells, players[i].online);
      }

      var player = this.getPlayer(players[i].id);

      if (player) {
        player.setColor(players[i].color);
        player.setCells(players[i].cells);
        player.setOnline(players[i].online);
      } else {
        this.addPlayer(players[i]);
      }
    }
  };

  return PlayerManager;
});