var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var requirejs = require('requirejs');

requirejs.config({
  baseUrl: './app',
  name: 'main'
});

requirejs(['app/main.js'], function(Conway) {
  var environment = process.env.NODE_ENV || 'development';

  // General configuration
  app.set('port', process.env.PORT || 3000);

  // Development
  if (environment === 'development') {
    app.use(errorhandler());
    app.use(express.static(path.join(__dirname, 'public')));
  }

  http.listen(app.get('port'), function() {
    console.log('Conway started: ' + app.get('port') + ' (' + environment + ')');
  });

  app.use(bodyParser());

  var conway = new Conway(fs, io);
});