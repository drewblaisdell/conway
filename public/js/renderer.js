define(['lib/d3'], function(d3) {
  var Renderer = function(app) {
    this.app = app;
    this.grid = app.game.grid;
    this.width = app.width;
    this.height = app.height;
    this.d3 = d3;
    this.cellSize = 8;
    this.spacing = 1;

    this.pixelWidth = this.width * (this.cellSize + this.spacing);
    this.pixelHeight = this.height * (this.cellSize + this.spacing);
  };

  Renderer.prototype.init = function() {
    var d3 = this.d3,
      cellSize = this.cellSize,
      cells = this.grid.getCells(),
      _this = this;

    this.svg = d3.select('#game').append('svg');
    this.svg.attr('width', this.pixelWidth);
    this.svg.attr('height', this.pixelHeight);
    
    this.svgEl = this.svg[0][0];

    this.svgEl.onselectstart = function(event) {
      event.preventDefault();
    };
  };

  Renderer.prototype.render = function() {
    var d3 = this.d3,
      cellSize = this.cellSize,
      cells = this.grid.getCells(),
      _this = this;

    if(!this.rendered) {
      this.rect = this.svg.selectAll('rect')
        .data(cells).enter().append('rect')
        .attr('transform', function(d) {
          var x = d.x * (cellSize + _this.spacing),
            y = d.y * (cellSize + _this.spacing);

          return "translate(" + x + ", " + y + ")";
        })
        .attr('data-x', function(d) {
          return d.x;
        })
        .attr('data-y', function(d) {
          return d.y;
        })
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('fill', function(d) {
          return (d.alive) ? "#0af" : "#fff";
        })
        .on('click', function(d) {
          d.setAlive();
        });

      this.rendered = true;
    } else {
      this.svg.selectAll('rect').data(cells)
        .each(function(d) {
          if(d.isDirty()){
            d3.select(this).attr('fill', ((d.alive) ? "#0af" : "#fff"));

            d.setClean();
          }
        });
    }
  };

  return Renderer;
});