define([], function() {
  var GameClient = function(app, game, playerManager) {
    this.app = app;
    this.game = game;
    this.playerManager = playerManager;
    this.config = app.config;

    this.updating = false;
  };

  GameClient.prototype.createNewPlayer = function(callback) {
    var _this = this,
      data = {};

    $.ajax({
      url: '/createNewPlayer',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(data) {
        var newPlayer = _this.playerManager.createNewPlayer(data.id, data.color);
        _this.playerManager.setLocalPlayer(newPlayer);

        if (typeof callback === 'function') {
          callback(data);
        }
      }
    });
  };

  GameClient.prototype.getPlayers = function(callback) {
    var _this = this;

    $.get('/players', function(data) {
      _this.playerManager.addPlayers(data);

      if (typeof callback === 'function') {
        callback(data);
      }
    });
  };

  GameClient.prototype.getUpdate = function(callback) {
    var _this = this;
    this.updating = true;

    $.get('/state', function(data) {
      // set everything equal to the state the server sent back

      _this.game.generation = data.generation;
      _this.game.nextTick = (+new Date) + data.timeBeforeTick;
      _this.game.grid.setLivingCells(data.livingCells);

      _this.playerManager.updatePlayers(data.players);      

      console.log('update for generation ' + data.generation);

      _this.nextUpdate = (+new Date) + _this.config.timeBetweenUpdates;
      _this.updating = false;

      if (typeof callback === 'function') {
        callback(data);
      }
    });
  };

  GameClient.prototype.isTimeToUpdate = function() {
    var now = +new Date;
    return (now >= this.nextUpdate);
  };

  GameClient.prototype.placeLiveCells = function(cells, callback) {
    var _this = this,
      localPlayer = this.playerManager.getLocalPlayer(),
      message = {
        'cells': cells,
        'playerId': localPlayer.id
      };

    if (!this.game.canPlaceLiveCells(localPlayer, cells)) {
      return false;
    }

    $.ajax({
      url: '/placeLiveCells',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(message),
      success: function(data) {
        if (data.success) {
          _this.game.placeCells(_this.playerManager.getLocalPlayer(), cells);
        }

        if (typeof callback === 'function') {
          callback(data);
        }
      }
    });
  };

  return GameClient;
})