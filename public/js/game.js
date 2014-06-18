define(['grid'], function(Grid) {
  var Game = function(app) {
    this.app = app;

    this.generation = 0;

    this.nextTick = +new Date;
    this.gameStart = +new Date;
    this.updating = false;
  };

  Game.prototype.init = function(width, height) {
    this.grid = new Grid(this.app);
    this.grid.init(width, height);
  };

  Game.prototype.getUpdate = function(callback) {
    var _this = this;
    this.updating = true;
    $.get('/state', function(data) {
      if (_this.nextUpdate === undefined
        || _this.generation === data.generation
        || _this.generation < (data.generation - 1)) {
        // this is either the initial update
        // or an update where the server/client are on the same generation
        // or an update where the client is more than one generation behind
        // and needs to catch up

        _this.generation = data.generation;
        _this.nextTick = (+new Date) + data.timeBeforeTick;
        _this.grid.setLivingCells(data.livingCells);

        console.log("client: " + _this.generation, "server: "+ data.generation);
      } else if (_this.generation === (data.generation - 1)) {
        // client is one generation behind
        // set the next generations to 
      }


      _this.nextUpdate = (+new Date) + _this.app.config.timeBetweenUpdates;
      _this.updating = false;
      if (typeof callback === 'function') {
        callback(data);
      }
    });
  };

  Game.prototype.isTimeToTick = function() {
    var now = +new Date;
    return (now >= this.nextTick);
  };

  Game.prototype.isTimeToUpdate = function() {
    var now = +new Date;
    return (now >= this.nextUpdate);
  };

  Game.prototype.tick = function() {
    this.generation += 1;
    this.grid.setNextGeneration();
    this.grid.tick();

    this.nextTick += this.app.config.generationDuration;
  };

  return Game;
});