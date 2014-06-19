var http = require('http');
var path = require('path');
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var requirejs = require('requirejs');

requirejs.config({
  baseUrl: './app',
  name: 'main'
});

var appServer = express();

var environment = process.env.NODE_ENV || 'development';

requirejs(['app/main.js'], function(conwayApp) {
  appServer.use(bodyParser());
  var routes = require('./config/routes.js')(appServer, conwayApp);
});

// General configuration
appServer.set('port', process.env.PORT || 3000);
// var routes = require('./config/routes.js')(appServer, game);

// Development
if (environment === 'development') {
  appServer.use(errorhandler());
  appServer.use(express.static(path.join(__dirname, 'public')));
}

http.createServer(appServer).listen(appServer.get('port'), function() {
  console.log('Conway started: ' + appServer.get('port') + ' (' + environment + ')');
});