define([], function() {
  return {
    // render settings
    aliveCellColor: '#00aaff',
    deadCellColor: '#ffffff',
    hoveredCellColor: '#11ff77',
    cellSize: 9,
    cellSpacing: 1,

    // grid settings
    gridWidth: 90,
    gridHeight: 45,

    // game settings
    generationDuration: 5000,

    // player settings
    cellsPerPlayer: 100,
    defaultPlayerColor: '#00aaff',

    // server settings
    timeBetweenStateUpdates: 5000,
    secretToken: "secret witch's brew"
  };
});