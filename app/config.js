define([], function() {
  return {
    // render settings
    deadCellColor: '#ffffff',
    cellSize: 9,
    cellSpacing: 1,

    // grid settings
    gridWidth: 90,
    gridHeight: 45,

    // game settings
    generationDuration: 5000,
    giveCellsEvery: 6, // generations
    
    // player settings
    cellsPerPlayer: 12,
    defaultPlayerColor: '#00aaff',

    // server settings
    timeBetweenStateUpdates: 10000,
    secretToken: "secret witch's brew"
  };
});