define(['cell'], function(Cell) {
  var Grid = function(app) {
    this.app = app;
    this.cells = [];
    this.dirty = true;
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

  Grid.prototype.getLivingCells = function() {
    var aliveCells = [],
      cells = this.getCells(),
      i,
      l = cells.length;

    for (i = 0; i < l; i++) {
      if (cells[i].alive) {
        aliveCells.push(cells[i]);
      }
    }

    return aliveCells;
  };

  Grid.prototype.getCells = function() {
    return [].concat.apply([], this.cells);
  };

  Grid.prototype.getCell = function(x, y) {
    x = Math.max(x, 0);
    y = Math.max(y, 0);
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

  Grid.prototype.setClean = function() {
    this.dirty = false;
  };

  Grid.prototype.isDirty = function() {
    return this.dirty;
  };

  Grid.prototype.setDirty = function() {
    this.dirty = true;
  }

  Grid.prototype.setNextGeneration = function(nextGeneration) {
    var cells = this.getCells(),
      i,
      l = cells.length;

    if (nextGeneration !== undefined) {
      // the server calculated the next generation for us
      
      var j = nextGeneration.length;

      // kill all the cells
      for (i = 0; i < l; i++) {
        cells[i].aliveNextGeneration = false;
      }

      // bring the living ones back
      for (i = 0; i < j; i++) {
        var cell = this.getCell(nextGeneration[i].x, nextGeneration[i].y);
        cell.aliveNextGeneration = true;
      }
    } else {
      // we need to calculate the next generation locally

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
    }
  };

  // setLivingCells sets the state of the board instantly, without ticking
  Grid.prototype.setLivingCells = function(newCells) {
    var i,
      cells = this.getCells(),
      j = cells.length,
      l = newCells.length;

    for (i = 0; i < j; i++) {
      cells[i].set('alive', false);
    }

    for (i = 0; i < l; i++) {
      var cell = this.getCell(newCells[i].x, newCells[i].y);
      cell.set('alive', newCells[i].alive);
    }
  };

  Grid.prototype.tick = function() {
    var cells = this.getCells(),
      i,
      l = cells.length;

    for (i = 0; i < l; i++) {
      cells[i].set('alive', cells[i].aliveNextGeneration);
      cells[i].aliveNextGeneration = undefined;
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