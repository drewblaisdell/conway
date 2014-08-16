define(['colorpicker', 'leaderboard', 'playersonline', 'chat'], function(Colorpicker, Leaderboard, PlayersOnline, Chat) {
  var Renderer = function(app) {
    this.app = app;
    this.game = app.game;
    this.gameClient = app.gameClient;
    this.playerManager = app.playerManager;
    this.chatManager = app.chatManager;
    this.config = app.config;
    this.grid = app.game.grid;
    this.width = app.width;
    this.height = app.height;
    this.cellSize = this.config.cellSize;
    this.spacing = this.config.cellSpacing;
    this.pickedColor = false;
    this.hoveredCell = undefined;
    this.hoveredPlayer = undefined;
    this.flaggedCells = [];
    this.onlinePlayerCount = this.playerManager.getOnlinePlayers().length;
    this.lastHighScore = false;
    this.lastCellsOnGrid = 0;
    this.lastCellCount = 0;
    this.lastChatMessage = 0;

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
    this.connectingEl = document.getElementById('connecting');
    this.tickBar = document.getElementById('tickbar');
    this.tickBarContext = this.tickBar.getContext('2d');
    this.favicon = document.getElementById('favicon');
    this.nameInput = document.getElementById('new-player').querySelector('.player-name');
    this.newPlayerErrorEl = document.getElementById('new-player-error-message');
    this.newPlayerEl = document.getElementById('new-player');
    this.controlsEl = document.getElementById('controls');
    this.placeCellsEl = this.controlsEl.querySelector('.place-cells');
    this.statsEl = document.getElementById('stats');
    this.highScoreEl = document.getElementById('high-score');
    this.cellCountEl = this.statsEl.querySelector('.cell-count');
    this.cellsOnGridEl = this.statsEl.querySelector('.cells-on-grid');
    this.rulesEl = document.getElementById('rules');
    this.leaveGameContainerEl = document.getElementById('leave-game-container');
    this.newCellMessageEl = document.getElementById('new-cell-message');
    this.newHighScoreMessageEl = document.getElementById('new-high-score-message'); 
    this.flashNewsEl = document.getElementById('flash-news');
    this.observeLinkEl = document.getElementById('observe');
    this.cellsOnGridStatEl = document.getElementById('cells-on-grid-stat');

    this.colorpicker = new Colorpicker(this.app);
    this.colorpicker.init();

    this.leaderboard = new Leaderboard(this.app);
    this.leaderboard.init();
    this.leaderboard.el.addEventListener('mouseover', this._handleMouseOverPlayers.bind(this), false);
    this.leaderboard.el.addEventListener('mouseleave', this._handleMouseLeavePlayers.bind(this), false);

    this.playersOnline = new PlayersOnline(this.app);
    this.playersOnline.init();
    this.playersOnline.el.addEventListener('mouseover', this._handleMouseOverPlayers.bind(this), false);
    this.playersOnline.el.addEventListener('mouseleave', this._handleMouseLeavePlayers.bind(this), false);

    this.chat = new Chat(this.app);
    this.chat.init();

    this.playButton = document.getElementById('new-player').querySelector('.play');

    this.observeLinkEl.addEventListener('click', this._handleClickObserve.bind(this), false);

    // highlight the current player's cells when hovering over the stats
    this.cellsOnGridStatEl.addEventListener('mouseover', this._handleMouseOverCellsOnGridStat.bind(this), false);
    this.cellsOnGridStatEl.addEventListener('mouseleave', this._handleMouseLeaveCellsOnGridStat.bind(this), false);

    // request a new player when the play button is clicked
    this.playButton.addEventListener('click', this._handlePlayButtonClick.bind(this), false);

    // submit new player on enter when selecting the input box
    this.nameInput.addEventListener('keypress', function(event) {
      var key = event.which || event.keyCode;

      if (key === 13) {
        _this._handlePlayButtonClick.bind(_this)(event);
      }
    });

    // prevent text selection when interacting with the canvas
    this.canvas.addEventListener('selectstart', function(e) {
      event.preventDefault();
    });

    // show the rules
    document.getElementById('rules-link').addEventListener('click', this._handleClickRulesLink.bind(this), false);

    // hide the rules when clicking the overlay
    this.rulesEl.addEventListener('click', this._handleClickRulesOverlay.bind(this), false);

    // "log out" of the current user
    document.getElementById('leave-game').addEventListener('click', this._handleLeaveGame.bind(this), false);

    // keep track of the mouse position on the canvas
    this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this), false);

    // repaint the hovered cell when the mouse leaves the canvas
    this.canvas.addEventListener('mouseleave', this._handleMouseLeave.bind(this), false);

    // make the cell living when clicked
    this.canvas.addEventListener('click', this._handleClick.bind(this), false);

    // attempt to place flagged cells when the place cells button is pushed
    this.placeCellsEl.addEventListener('click', this._handlePlaceCells.bind(this));

    this.canvas.width = this.pixelWidth;
    this.canvas.height = this.pixelHeight;
    this.canvas.parentElement.style.width = this.pixelWidth + 'px';
    this.canvas.parentElement.style.height = this.pixelHeight + 'px';

    this.tickBar.width = this.pixelWidth;
    this.tickBar.height = this.tickBarHeight;

    this.gameEl.style.width = this.pixelWidth + 'px';

    this._drawGrid();

    this.setAccentColor(this.config.defaultAccentColor);
    this.setFaviconColor(this.config.defaultAccentColor);
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

  Renderer.prototype.flashNews = function() {
    var _this = this,
      news = false,
      localPlayer = this.playerManager.getLocalPlayer();

    this.flashNewsEl.style.color = this.color;
    this.flashNewsEl.innerHTML = '';
    
    if (localPlayer) {
      if (this.lastHighScore === false) {
        this.lastHighScore = localPlayer.highScore;
      }

      if (this.game.isTimeToGiveNewCells() && localPlayer.cells < this.config.cellsPerPlayer) {
        this.flashNewsEl.innerHTML += '+1 new cell<br>';
        news = true;
      }

      if (localPlayer.highScore > this.lastHighScore) {
        this.lastHighScore = localPlayer.highScore;

        this.flashNewsEl.innerHTML += 'new high score';
        news = true;
      }

      if (news) {
        _this.flashNewsEl.className = 'active';

        setTimeout(function() {
          _this.flashNewsEl.className = '';
        }, 1500);
      }
    }
  };

  Renderer.prototype.handleConnect = function() {
    var _this = this;

    this.connectingEl.style.opacity = 0;

    setTimeout(function() {
      _this.connectingEl.style.display = 'none';
      _this.gameEl.style.display = 'block';
      _this.gameEl.style.opacity = 1;
      _this.chat.scrollToBottom();
    }, 500);
  };

  Renderer.prototype.hideRules = function() {
    var _this = this;
    this.rulesEl.style.opacity = 0;

    setTimeout(function() {
      _this.rulesEl.style.display = 'none';
    }, 250);
  };

  Renderer.prototype.hideOverlay = function() {
    var _this = this;
    this.newPlayerEl.parentElement.style.opacity = 0;

    setTimeout(function() {
      _this.newPlayerEl.parentElement.style.display = 'none';
    }, 500);
  };

  Renderer.prototype.newPlayerError = function(message) {
    this.newPlayerErrorEl.innerHTML = message;
    this.newPlayerErrorEl.style.display = 'block';
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
      onlinePlayerCount = this.playerManager.getOnlinePlayers().length,
      cellCount,
      cellsOnGrid;

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

    if (this.lastChatMessage !== this.chatManager.lastChatMessage) {
      this.chat.render();
      this.lastChatMessage = this.chatManager.lastChatMessage;
    }

    this._drawTickBar(this.game.percentageOfTick());

    if (this.onlinePlayerCount !== onlinePlayerCount) {
      // players joined/left since last render
      this.onlinePlayerCount = onlinePlayerCount;

      this.updatePlayersOnline();
    }

    if (localPlayer) {
      cellCount = localPlayer.cells;
      cellsOnGrid = localPlayer.cellsOnGrid;

      if (cellCount !== this.lastCellCount || cellsOnGrid !== this.cellsOnGrid) {
        this.lastCellCount = cellCount;
        this.cellsOnGrid = cellsOnGrid;

        this.updateStats();
        this.updateLeaderboard();
      }
    }
  };

  Renderer.prototype.setAccentColor = function(color) {
    this.color = color;
  };

  Renderer.prototype.setFaviconColor = function(color) {
    var canvas = document.createElement('canvas'),
      link = this.favicon,
      context;

    canvas.width = 16,
    canvas.height = 16,
    context = canvas.getContext('2d'),

    context.fillStyle = color;
    context.fillRect(0, 0, 16, 16);
    context.fill();

    link.href = canvas.toDataURL();
  };

  Renderer.prototype.showControls = function() {
    this.controlsEl.style.display = 'block';
  };

  Renderer.prototype.showLeaveGameContainer = function() {
    this.leaveGameContainerEl.style.display = 'inline-block';
  };

  Renderer.prototype.showNewChatBox = function() {
    this.chat.showNewChatBox();
  };

  Renderer.prototype.showRules = function() {
    var _this = this;
    this.rulesEl.style.display = 'block';

    setTimeout(function() {
      _this.rulesEl.style.opacity = 1;
    }, 1);
  };

  Renderer.prototype.showStats = function() {
    this.statsEl.style.display = 'block';
  };

  Renderer.prototype.updateControls = function() {
    var localPlayer = this.playerManager.getLocalPlayer();

    if (localPlayer) {
      var cellCount = localPlayer.cells,
        cellsOnGrid = localPlayer.cellsOnGrid;

      if (this.flaggedCells.length > 0
        && localPlayer.cells >= this.flaggedCells.length
        && this.game.canPlaceLiveCells(localPlayer, this.flaggedCells)) {
        this.placeCellsEl.className = 'place-cells enabled';
        this.placeCellsEl.style.borderColor = this.color;
      } else {
        this.placeCellsEl.className = 'place-cells';
        this.placeCellsEl.style.borderColor = '';
      }
    }
  };

  Renderer.prototype.updateStats = function() {
    var localPlayer = this.playerManager.getLocalPlayer(),
      cellCount,
      cellsOnGrid;

    if (localPlayer) {
      cellCount = localPlayer.cells;
      cellsOnGrid = localPlayer.cellsOnGrid;

      this.highScoreEl.innerHTML = localPlayer.highScore;
      this.cellCountEl.innerHTML = cellCount;
      this.cellsOnGridEl.innerHTML = cellsOnGrid;
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
      y1 = cell.y * (cellSize + spacing) + 1,
      color;

    if (!cell.alive) {
      context.fillStyle = config.deadCellColor;
    } else {
      context.fillStyle = this.playerManager.getPlayer(cell.playerId).color;      
    }

    if (this.hoveredPlayer) {
      if (cell.alive && cell.playerId !== this.hoveredPlayer) {
        color = this._hexToRGB(this.playerManager.getPlayer(cell.playerId).color);
        color.r = Math.floor(((255 - color.r) / 1.4) + color.r);
        color.g = Math.floor(((255 - color.g) / 1.4) + color.g);
        color.b = Math.floor(((255 - color.b) / 1.4) + color.b);

        context.fillStyle = 'rgba('+ color.r +', '+ color.g +', '+ color.b +', 1)';
      }
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

  Renderer.prototype._handleClickObserve = function(event) {
    this.hideOverlay();

    event.preventDefault();
  };

  Renderer.prototype._handleClickRulesLink = function(event) {
    this.showRules();

    event.preventDefault();
  };

  Renderer.prototype._handleClickRulesOverlay = function(event) {
    // make sure we're clicking the overlay and not the rules box content
    if (event.target !== this.rulesEl) {
      return false;
    }

    this.hideRules();
  };

  Renderer.prototype._handleLeaveGame = function(event) {
    if (confirm("Are you sure you want to leave? You won't be able to log in to your user again.")) {
      this.app.deleteToken();
      location.reload();
    }

    event.preventDefault();
  };

  Renderer.prototype._handleMouseLeave = function(event) {
    var oldCell = this.hoveredCell;
    this.hoveredCell = undefined;
    this._drawCell(oldCell);
  };

  Renderer.prototype._handleMouseLeavePlayers = function(event) {
    this.hoveredPlayer = false;
    this.render();
  };

  Renderer.prototype._handleMouseLeaveCellsOnGridStat = function(event) {
    this.hoveredPlayer = false;
    this.render();
  };

  Renderer.prototype._handleMouseMove = function(event) {
    if (event.offsetX && event.offsetY) {
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
    } else {
      var rect = this.canvas.getBoundingClientRect();

      this.lastX = event.pageX - rect.left - window.scrollX;
      this.lastY = event.pageY - rect.top - window.scrollY;
    }

    var player = this.playerManager.getLocalPlayer(),
      oldCell = this.hoveredCell;
    this.hoveredCell = this.getCellFromPosition(this.lastX, this.lastY);

    this._drawCell(oldCell);

    if (this.app.isPlaying() && (player.cells - this.flaggedCells.length) > 0) {
      this._drawFramedCell(this.hoveredCell);
    }
  };

  Renderer.prototype._handleMouseOverPlayers = function(event) {
    var playerId = event.target.dataset.playerId || event.target.parentElement.dataset.playerId;

    if (playerId) {
      this.hoveredPlayer = parseInt(playerId);
      this.render();
    }
  };

  Renderer.prototype._handleMouseOverCellsOnGridStat = function(event) {
    this.hoveredPlayer = this.playerManager.getLocalPlayer().id;
    this.render();
  };

  Renderer.prototype._handlePlaceCells = function(event) {
    var player = this.playerManager.getLocalPlayer();

    event.preventDefault();
    
    if (this.game.canPlaceLiveCells(player, this.flaggedCells)) {
      this.gameClient.placeLiveCells(this.flaggedCells);
      this.flaggedCells = [];
    } else {
      return false;
    }
  };

  Renderer.prototype._handlePlayButtonClick = function(event) {
    event.preventDefault();

    var color = this.color,
      name = this.nameInput.value.trim();

    if (name.length === 0 || !this.colorpicker.colorWasPicked()) {
      return false;
    }

    name = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    this.gameClient.requestNewPlayer(name, color);
  };

  Renderer.prototype._hexToRGB = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return Renderer;
});