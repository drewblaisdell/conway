define(['cell'], function(Cell) {
  var Grid = function(app) {
    this.app = app;
    this.cells = [];
  };

  Grid.prototype.getLivingNeighborCount = function(x, y) {
    var i,
      n = 0,
      neighbors = this.getNeighbors(x, y),
      l = neighbors.length;

    for (i = 0; i < l; i++) {
      if (neighbors[i].alive) {
        n += 1;
      }
    }

    return n;
  };

  Grid.prototype.getCells = function() {
    return [].concat.apply([], this.cells);
  };

  Grid.prototype.getCell = function(x, y) {
    return this.cells[y][x];
  };

  Grid.prototype.getNeighbors = function(x, y) {
    var i,
      neighbors = [],
      tests = [
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x - 1, y],
        [x + 1, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1]
      ],
      l = tests.length;

    for (i = 0; i < l; i++) {
      var test = tests[i];

      if (test[0] >= 0 && test[0] < this.width && test[1] >= 0 && test[1] < this.height) {
        neighbors.push(this.getCell(test[0], test[1]));
      }
    }

    return neighbors;
  };

  Grid.prototype.getRandomCell = function() {
    var x = Math.floor(Math.random() * this.width),
      y = Math.floor(Math.random() * this.height);

    return this.getCell(x, y);
  };

  Grid.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.cells = this._buildCells(width, height);
  };

  Grid.prototype.setNextGeneration = function() {
    var cells = this.getCells(),
      i,
      l = cells.length;

    for (i = 0; i < l; i++) {
      var cell = cells[i],
        livingNeighbors = this.getLivingNeighborCount(cell.x, cell.y);

      if (livingNeighbors > 0) {
        if (cell.alive) {
          if (livingNeighbors < 2) {
            // live cells with < 2 neighbors die
            cell.aliveNextGeneration = false;
          } else if (livingNeighbors === 2 || livingNeighbors === 3) {
            // live cells with 2 or 3 neighbors live
            cell.aliveNextGeneration = true;
          } else {
            // live cells with more than three neighbors die
            cell.aliveNextGeneration = false;
          }
        } else {
          if (livingNeighbors === 3) {
            // dead cells with three neighbors become live cells
            cell.aliveNextGeneration = true;
          }
        }
      }
    }
  };

  Grid.prototype.tick = function() {
    var cells = this.getCells(),
      i,
      l = cells.length;

    for (i = 0; i < l; i++) {
      cells[i].tick();
    }
  };

  Grid.prototype._buildCells = function(width, height) {
    var i, j, cells = new Array(height);

    for (i = 0; i < height; i++) {
      cells[i] = new Array(width);
      for (j = 0; j < width; j++) {
        cells[i][j] = new Cell(j, i);
      }
    }

    return cells;
  };

  return Grid;
});