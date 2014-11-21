define([], function() {
  return {
    // render settings
    deadCellColor: '#ffffff',
    cellSize: 9,
    cellSpacing: 1,

    // grid settings
    gridWidth: 100,
    gridHeight: 50,

    // game settings
    generationDuration: 5000,
    giveCellsEvery: 6, // generations
    
    // player settings
    cellsPerPlayer: 12,
    defaultPlayerColor: '#00aaff',
    lastSeenTimeout: 180000,

    // server settings
    timeBetweenStateUpdates: 10000,
    secretToken: "secret witch's brew",
    lowestHighScore: 200,
    chatLogLength: 175,
    chatMessageLength: 140,
    timeBetweenLatencyTests: 10000
  };
});