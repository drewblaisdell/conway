var http = require('http');
var path = require('path');
var express = require('express');
var errorhandler = require('errorhandler');

var app = express();
var environment = process.env.NODE_ENV || 'development';

// General configuration
app.set('port', process.env.PORT || 3000);
var routes = require('./config/routes.js')(app);

// Development
if (environment === 'development') {
  app.use(errorhandler());
  app.use(express.static(path.join(__dirname, 'public')));
}

http.createServer(app).listen(app.get('port'), function() {
  console.log('Conway started: ' + app.get('port') + ' (' + environment + ')');
});