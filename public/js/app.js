define(['game', 'renderer'], function(Game, Renderer) {
  var App = function() {};

  App.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.game = new Game(this);
    this.game.init(width, height);

    this.renderer = new Renderer(this);
    this.renderer.init();

    this.lastTick = +new Date;
  };

  App.prototype.run = function() {
    var _this = this;

    requestAnimationFrame(function() {
      var now = +new Date;
    
      if (now - _this.lastTick > 500) {
        _this.game.grid.setNextGeneration();
        _this.game.grid.tick();

        _this.lastTick = now;
      }
    
      _this.renderer.render();
      _this.run();
    });
  };

  return App;
});