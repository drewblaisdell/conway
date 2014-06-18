define([], function() {
  var GameClient = function(app, game) {
    this.app = app;
    this.game = game;
    this.config = app.config;

    this.updating = false;
  };

  GameClient.prototype.getUpdate = function(callback) {
    var _this = this;
    this.updating = true;

    $.get('/state', function(data) {
      // set everything equal to the state the server sent back

      _this.game.generation = data.generation;
      _this.game.nextTick = (+new Date) + data.timeBeforeTick;
      _this.game.grid.setLivingCells(data.livingCells);

      console.log('update for generation ' + data.generation);

      _this.nextUpdate = (+new Date) + _this.config.timeBetweenUpdates;
      _this.updating = false;

      if (typeof callback === 'function') {
        callback(data);
      }
    });
  };

  GameClient.prototype.isTimeToUpdate = function() {
    var now = +new Date;
    return (now >= this.nextUpdate);
  };

  GameClient.prototype.placeLiveCells = function(cells, callback) {
    var _this = this,
      message = { "cells": cells };

    if (!this.game.canPlaceLiveCells(cells)) {
      callback(false);
      return false;
    }

    $.ajax({
      url: '/placeLiveCells',
      type: 'POST',
      dataType: 'json',
      contentType: 'json',
      data: JSON.stringify(message),
      success: function(data) {
        callback(data);
      }
    });
  };

  return GameClient;
})