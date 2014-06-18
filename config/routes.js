module.exports = function(app, game) {
  app.get('/', function(req, res) {
    res.render('main.ejs');
  });

  app.get('/state', function(req, res) {
    // only send the relevant info
    var livingCells = game.grid.getLivingCells().map(function(cell) {
      return {
        x: cell.x,
        y: cell.y,
        alive: cell.alive
      };
    });

    var update = {
      generation: game.generation,
      timeBeforeTick: (game.nextTick - (+new Date)),
      livingCells: livingCells
    };

    res.json(update);
  });

  app.post('/placeLiveCells', function(req, res) {
    console.log(req.body);
  });
};