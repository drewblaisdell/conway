module.exports = function(app, conwayApp) {
  var game = conwayApp.game;

  app.get('/', function(req, res) {
    res.render('main.ejs');
  });

  app.get('/state', function(req, res) {
    // only send the relevant info
    var livingCells = game.grid.getLivingCells().map(function(cell) {
      return {
        x: cell.x,
        y: cell.y,
        alive: cell.alive,
        playerId: cell.playerId
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
    var cells = req.param('cells'),
      playerId = req.param('playerId'),
      player = conwayApp.playerManager.getPlayer(playerId);

    if (game.canPlaceLiveCells(player, cells)) {
      game.placeCells(player, cells);
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

  });

  app.post('/createNewPlayer', function(req, res) {
    var player = conwayApp.playerManager.createNewPlayer(),
      cleanPlayer = {
        id: player.id,
        color: player.color
      };

    res.json(player);
  });
};