define(['jquery', 'colorpicker', 'leaderboard', 'playersonline'], function($, Colorpicker, Leaderboard, PlayersOnline) {
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
    this.onlinePlayerCount = this.playerManager.getOnlinePlayers().length;

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

    this.gameEl = document.getElementById('game');
    this.tickBar = document.getElementById('tickbar');
    this.tickBarContext = this.tickBar.getContext('2d');

    this.newPlayerEl = document.getElementById('new-player');

    this.colorpicker = new Colorpicker(this.app);
    this.colorpicker.init();

    this.leaderboard = new Leaderboard(this.app);
    this.leaderboard.init();

    this.playersOnline = new PlayersOnline(this.app);
    this.playersOnline.init();

    this.playButton = document.getElementById('new-player').querySelector('.play');

    // request a new player when the play button is clicked
    this.playButton.addEventListener('click', this._handlePlayButtonClick.bind(this), false);

    // prevent text selection when interacting with the canvas
    this.canvas.addEventListener('selectstart', function(e) {
      event.preventDefault();
    });

    var that = this;

    // "log out" of the current user
    document.getElementById('leave-game').addEventListener('click', this._handleLeaveGame.bind(this), false);

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
    this.canvas.parentElement.style.width = this.pixelWidth + 'px';
    this.canvas.parentElement.style.height = this.pixelHeight + 'px';


    this.tickBar.width = this.pixelWidth;
    this.tickBar.height = this.tickBarHeight;

    this.gameEl.style.width = this.pixelWidth + 'px';

    this._drawGrid();
  };

  Renderer.prototype.getCellFromPosition = function(x, y) {
    var cellSize = this.cellSize,
      spacing = this.spacing,
      cellX = Math.floor((x - 1) / (cellSize + spacing)),
      cellY = Math.floor((y - 1) / (cellSize + spacing));

    if (cellY === this.config.gridHeight) {
      cellY--;
    }

    return this.grid.getCell(cellX, cellY);
  };

  Renderer.prototype.clear = function() {
    this.context.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
  };

  Renderer.prototype.hideOverlay = function() {
    var _this = this;
    this.newPlayerEl.parentElement.style.opacity = 0;

    setTimeout(function() {
      _this.newPlayerEl.parentElement.style.display = 'none';
    }, 500);
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
      localPlayer = this.playerManager.getLocalPlayer(),
      onlinePlayerCount = this.playerManager.getOnlinePlayers().length;

    for (var i = 0; i < cells.length; i++) {
      if (cells[i].isDirty()) {
        this._drawCell(cells[i]);
        cells[i].setClean();
      }
    }

    if (this.playerManager.localPlayer && localPlayer.isDirty()) {
      this.updateControls();
      localPlayer.setClean();
    }

    this._drawTickBar(this.game.percentageOfTick());

    if (this.onlinePlayerCount !== onlinePlayerCount) {
      // players joined/left since last render
      this.onlinePlayerCount = onlinePlayerCount;

      this.updatePlayersOnline();
    }
  };

  Renderer.prototype.setAccentColor = function(color) {
    this.color = color;
  };

  Renderer.prototype.updateControls = function() {
    var localPlayer = this.playerManager.getLocalPlayer();

    if (localPlayer) {
      var cellCount = localPlayer.cells,
        cellsOnGrid = localPlayer.cellsOnGrid;

      $('#controls, #stats').show();
      $('#new-player').hide();

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
    } else {
      $('#controls, #stats').hide();
      $('#new-player').show();
    }
  };

  Renderer.prototype.updateLeaderboard = function() {
    this.leaderboard.render();
  };

  Renderer.prototype.updatePlayersOnline = function() {
    this.playersOnline.render();
  };

  Renderer.prototype._drawTickBar = function(percent) {
    var nextWidth = this.pixelWidth * percent,
      context = this.tickBarContext,
      x = (this.pixelWidth - nextWidth) / 2;

    context.clearRect(0, 0, this.pixelWidth, this.tickBarHeight);
    context.fillStyle = this.color;
    context.fillRect(x, 0, nextWidth, this.tickBarHeight);
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

    if (this.app.isPlaying() && this.hoveredCell !== undefined && this.hoveredCell.equals(cell)) {
      var player = this.playerManager.getLocalPlayer();
      if (player.cells - this.flaggedCells.length > 0) {
        this._drawFramedCell(cell);
      }
    }

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
      ],
      player = this.playerManager.getLocalPlayer();

    if (!app.isPlaying()){
      return false;
    }

    // if it isn't a flagged cell, and you have cells left to place
    if (!this._isFlaggedCell(clickedCell) && (player.cells - this.flaggedCells.length > 0)) {
      // flag it
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

  Renderer.prototype._handleLeaveGame = function(event) {
    this.app.deleteToken();
    location.reload();

    event.preventDefault();
  };

  Renderer.prototype._handleMouseLeave = function(event) {
    var oldCell = this.hoveredCell;
    this.hoveredCell = undefined;
    this._drawCell(oldCell);
  };

  Renderer.prototype._handleMouseMove = function(event) {
    this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
    this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);

    var player = this.playerManager.getLocalPlayer(),
      oldCell = this.hoveredCell;
    this.hoveredCell = this.getCellFromPosition(this.lastX, this.lastY);

    this._drawCell(oldCell);

    if (this.app.isPlaying() && (player.cells - this.flaggedCells.length) > 0) {
      this._drawFramedCell(this.hoveredCell);
    }
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

  Renderer.prototype._handlePlayButtonClick = function(event) {
    var color = this.color,
      name = document.getElementById('new-player').querySelector('.player-name').value;

    this.gameClient.requestNewPlayer(name, color);

    event.preventDefault();
  };

  return Renderer;
});