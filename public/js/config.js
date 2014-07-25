define([], function() {
  return {
    // render settings
    aliveCellColor: '#00aaff',
    deadCellColor: '#ffffff',
    hoveredCellColor: '#11ff77',
    defaultAccentColor: '#000000',
    cellSize: 9,
    cellSpacing: 1,
    tickBarHeight: 5,

    // grid settings
    gridWidth: 90,
    gridHeight: 45,

    // game settings
    generationDuration: 5000,
    timeBetweenUpdates: 10000,

    // player settings
    cellsPerPlayer: 100
  };
});