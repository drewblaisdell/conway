module.exports = function(app, game) {
  app.get('/', function(req, res) {
    res.render('main.ejs');
  });

  app.get('/test', function(req, res) {
    res.json(game.game.grid.getLivingCells());
  });
};