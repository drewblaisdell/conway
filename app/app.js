define(['game'], function(Game) {
  var App = function(config) {
    this.config = config;
  };

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);

    for (var i = 0; i < 2000; i++) {
      var c = this.game.grid.getRandomCell();
      c.setAlive();
    }

//    this.renderer = new Renderer(this);
//    this.renderer.init();

    this.lastTick = +new Date;
  };

  App.prototype.run = function() {
    var _this = this;

    setTimeout(function() {
      var now = +new Date;
    
      if (now - _this.lastTick > _this.config.generationDuration) {
        _this.game.grid.setNextGeneration();
        _this.game.grid.tick();

        _this.lastTick = now;
      }
    
//      _this.renderer.renderChanges();
      _this.run();
    }, 100);
  };

  return App;
});