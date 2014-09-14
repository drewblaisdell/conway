define([], function() {
  return {
    // render settings
    deadCellColor: '#ffffff',
    defaultAccentColor: '#000000',
    cellSize: 9,
    cellSpacing: 1,
    tickBarHeight: 5,

    // grid settings
    gridWidth: 100,
    gridHeight: 50,

    // game settings
    generationDuration: 5000,
    giveCellsEvery: 6, // generations
    timeBetweenUpdates: 10000,

    // player settings
    cellsPerPlayer: 12,
    lastSeenTimeout: 180000,

    // chat settings
    chatLogLength: 175,
    chatMessageLength: 140
  };
});