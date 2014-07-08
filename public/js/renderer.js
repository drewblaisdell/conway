define(['jquery'], function($) {
  var Renderer = function(app) {
    this.app = app;
    this.game = app.game;
    this.gameClient = app.gameClient;
    this.playerManager = app.playerManager;
    this.config = app.config;
    this.grid = app.game.grid;
    this.width = app.width;
    this.height = app.height;
    this.cellSize = this.config.cellSize;
    this.spacing = this.config.cellSpacing;
    this.pickedColor = false;
    this.hoveredCell = undefined;
    this.flaggedCells = [];

    this.pixelWidth = this.width * (this.cellSize + this.spacing) + 1;
    this.pixelHeight = this.height * (this.cellSize + this.spacing) + 1;

    this.tickBarHeight = this.config.tickBarHeight;

    this.nextTickBarUpdate = Date.now() + 100;
  };

  Renderer.prototype.init = function() {
    var cellSize = this.cellSize,
      cells = this.grid.getCells(),
      _this = this;

    this.canvas = document.getElementById('c');
    this.context = this.canvas.getContext('2d');

    this.gameEl = this.canvas.parentElement;
    this.tickBar = document.getElementById('tickbar');
    this.tickBarContext = this.tickBar.getContext('2d');

    this.colorpicker = document.getElementById('new-player').querySelector('.colorpicker');
    this.playButton = document.getElementById('new-player').querySelector('.play');

    // change the color picker color when the mouse moves over it
    this.colorpicker.addEventListener('mousemove', this._handleColorpickerMouseMove.bind(this), false);

    // save the color when the colorpicker is clicked
    this.colorpicker.addEventListener('click', this._handleColorpickerClick.bind(this), false);

    // show the picked color (if it exists) when the mouse leaves the color picker
    this.colorpicker.addEventListener('mouseleave', this._handleColorpickerMouseLeave.bind(this), false);

    // prevent text selection when interacting with the canvas
    this.canvas.addEventListener('selectstart', function(e) {
      event.preventDefault();
    });

    var that = this;

    // keep track of the mouse position on the canvas
    this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this), false);

    // repaint the hovered cell when the mouse leaves the canvas
    this.canvas.addEventListener('mouseleave', this._handleMouseLeave.bind(this), false);

    // make the cell living when clicked
    this.canvas.addEventListener('click', this._handleClick.bind(this), false);

    // attempt to place flagged cells when the place cells button is pushed
    $('#controls .place-cells').on('click', this._handlePlaceCells.bind(this));

    this.canvas.width = this.pixelWidth;
    this.canvas.height = this.pixelHeight;

    this.tickBar.width = this.pixelWidth;
    this.tickBar.height = this.tickBarHeight;

    $(this.gameEl).width(this.pixelWidth);

    this._drawGrid();
  };

  Renderer.prototype.getCellFromPosition = function(x, y) {
    var cellSize = this.cellSize,
      spacing = this.spacing,
      cellX = Math.floor((x - 1) / (cellSize + spacing)),
      cellY = Math.floor((y - 1) / (cellSize + spacing));

    return this.grid.getCell(cellX, cellY);
  };

  Renderer.prototype.clear = function() {
    this.context.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
  };

  Renderer.prototype.render = function() {
    var i,
      cells = this.grid.getCells(),
      l = cells.length;

    this.clear();
    this._drawGrid();

    // draw all cells, set clean
    for (i = 0; i < l; i++) {
      this._drawCell(cells[i]);
      cells[i].setClean();
    }
  };

  Renderer.prototype.renderChanges = function() {
    var now = Date.now(),
      cells = this.grid.getCells(),
      localPlayer = this.playerManager.getLocalPlayer();

    for (var i = 0; i < cells.length; i++) {
      if (cells[i].isDirty()) {
        this._drawCell(cells[i]);
        cells[i].setClean();
      }
    }

    if (localPlayer.isDirty()) {
      this.updateControls();
      localPlayer.setClean();
    }

    this.updateTickBar(this.game.percentageOfTick());

    // if (this.nextTickBarUpdate <= now) {
    //   this.updateTickBar(this.game.percentageOfTick());
    //   this.nextTickBarUpdate = now + 100;
    // }
  };

  Renderer.prototype.setAccentColor = function(color) {
    this.color = color;
  };

  Renderer.prototype.updateControls = function() {
    var localPlayer = this.playerManager.getLocalPlayer(),
      cellCount = localPlayer.cells,
      cellsOnGrid = this.game.getCellCountByPlayer(localPlayer.id);

    $('#stats .cell-count').text(cellCount);
    $('#stats .cells-on-grid').text(cellsOnGrid);

    if (this.flaggedCells.length > 0 && localPlayer.cells >= this.flaggedCells.length) {
      $('#controls .place-cells')
        .addClass('enabled')
        .css('border-color', this.color);
    } else {
      $('#controls .place-cells')
      .removeClass('enabled')
      .css('border-color', '');
    }
  };

  Renderer.prototype.updateTickBar = function(percent) {
    var nextWidth = this.pixelWidth * percent,
      context = this.tickBarContext;

    context.clearRect(0, 0, this.pixelWidth, this.tickBarHeight);
    context.fillStyle = this.color;
    context.fillRect(0, 0, nextWidth, this.tickBarHeight);
  };

  Renderer.prototype._drawGrid = function() {
    var i,
      config = this.config,
      context = this.context,
      cellSize = this.cellSize,
      spacing = this.spacing;

    for (i = 0; i < this.height; i++) {
      context.lineWidth = spacing;
      context.beginPath();
      context.moveTo(0, i * (cellSize + spacing) + 0.5);
      context.lineTo(this.pixelWidth, i * (cellSize + spacing) + 0.5);
      context.strokeStyle = 'rgba(0,0,0,1)';
      context.stroke();
    }

    for (i = 0; i < this.width; i++) {
      context.beginPath();
      context.moveTo(i * (cellSize + spacing) + 0.5, 0);
      context.lineTo(i * (cellSize + spacing) + 0.5, this.pixelHeight);
      context.stroke();
    }

    // finish the border
    context.beginPath();
    context.moveTo(this.pixelWidth - 0.5, 0);
    context.lineTo(this.pixelWidth - 0.5, this.pixelHeight);
    context.stroke();

    context.beginPath();
    context.moveTo(0, this.pixelHeight - 0.5);
    context.lineTo(this.pixelWidth - 0.5, this.pixelHeight - 0.5);
    context.stroke();
  };

  Renderer.prototype._drawCell = function(cell) {
    // return if the cell was made undefined by _handleMouseLeave
    if (cell === undefined) {
      return;
    }

    var config = this.config,
      context = this.context,
      cellSize = this.cellSize,
      spacing = this.spacing,
      x1 = cell.x * (cellSize + spacing) + 1,
      y1 = cell.y * (cellSize + spacing) + 1;

    if (!cell.alive) {
      context.fillStyle = config.deadCellColor;
    } else {
      context.fillStyle = this.playerManager.getPlayer(cell.playerId).color;      
    }
    context.fillRect(x1, y1, cellSize, cellSize);

    if (this._isFlaggedCell(cell)) {
      this._drawFramedCell(cell);
    }
  };

  Renderer.prototype._drawFramedCell = function(cell) {
    if (cell === undefined) {
      return;
    }

    var context = this.context,
      cellSize = this.cellSize,
      spacing = this.spacing,
      x1 = cell.x * (cellSize + spacing) + 1.5,
      y1 = cell.y * (cellSize + spacing) + 1.5;

    context.lineWidth = 1.5;
    context.strokeStyle = this.color;
    context.strokeRect(x1 + .5, y1 + .5, cellSize - 2, cellSize - 2);
  };

  Renderer.prototype._isFlaggedCell = function(cell) {
    for (var i = 0; i < this.flaggedCells.length; i++) {
      if (cell.equals(this.flaggedCells[i])) {
        return true;
      }
    }

    return false;
  };

  Renderer.prototype._handleClick = function(event) {
    var clickedCell = this.getCellFromPosition(this.lastX, this.lastY),
      cells = [
        {
          x: clickedCell.x,
          y: clickedCell.y
        }
      ];

    if (!this._isFlaggedCell(clickedCell)) {
      this.flaggedCells.push(clickedCell);
      clickedCell.setDirty();
    } else {
      // remove the cell
      for (var i = 0; i < this.flaggedCells.length; i++) {
        if (clickedCell.equals(this.flaggedCells[i])) {
          this.flaggedCells.splice(i, 1);
          clickedCell.setDirty();
          break;
        }
      }
    }

    this.updateControls();
  };

  Renderer.prototype._handleColorpickerMouseMove = function(event) {
    var x = event.offsetX || (event.pageX - this.colorpicker.offsetLeft),
      y = event.offsetY || (event.pageY - this.colorpicker.offsetTop),
      hue = (x / this.colorpicker.offsetWidth) * 360,
      sat = (y / this.colorpicker.offsetHeight) * 100 + '%',
      lit = '60%';

    this.colorpicker.style.background = 'hsla('+ hue +', '+ sat +', '+ lit +', 1)';
  };

  Renderer.prototype._handleColorpickerClick = function(event) {
    var x = event.offsetX || (event.pageX - this.colorpicker.offsetLeft),
      y = event.offsetY || (event.pageY - this.colorpicker.offsetTop),
      hue = (x / this.colorpicker.offsetWidth),
      sat = (y / this.colorpicker.offsetHeight),
      lit = .6,
      rgb = this._HSLtoRGB(hue, sat, lit),
      rgba = 'rgba('+ rgb[0] +', '+ rgb[1] +', '+ rgb[2] +', 1)';

    this.pickedColor = rgb;

    this.setAccentColor(rgba);

    this.playButton.style.borderColor = rgba;
    this.playButton.style.color = rgba;
  };

  Renderer.prototype._handleColorpickerMouseLeave = function(event) {
    if (this.pickedColor) {
      var rgb = this.pickedColor;
      this.colorpicker.style.background = 'rgba('+ rgb[0] +', '+ rgb[1] +', '+ rgb[2] +', 1)';
    } else {
      this.colorpicker.style.background = 'rgba(255, 255, 255, 1)';
    }
  };

  Renderer.prototype._handleMouseLeave = function(event) {
    var oldCell = this.hoveredCell;
    this.hoveredCell = undefined;
    this._drawCell(oldCell);
  };

  Renderer.prototype._handleMouseMove = function(event) {
    this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
    this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);

    var oldCell = this.hoveredCell;
    this.hoveredCell = this.getCellFromPosition(this.lastX, this.lastY);

    this._drawCell(oldCell);
    this._drawFramedCell(this.hoveredCell);
  };

  Renderer.prototype._handlePlaceCells = function(event) {
    var player = this.playerManager.getLocalPlayer();

    if (this.game.canPlaceLiveCells(player, this.flaggedCells)) {
      this.gameClient.placeLiveCells(this.flaggedCells);
      this.flaggedCells = [];
    } else {
      return false;
    }

    event.preventDefault();
  };

  Renderer.prototype._HSLtoRGB = function(h, s, l){
    var r, g, b;

    if(s == 0){
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  return Renderer;
});