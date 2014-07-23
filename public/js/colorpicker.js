define([], function() {
  var Colorpicker = function(app) {
    this.app = app;
    this.config = app.config;
    this.renderer = app.renderer;

    this.pickedColor = false;
  };

  Colorpicker.prototype.init = function() {
    this.playButton = document.getElementById('new-player').querySelector('.play');

    this.el = document.getElementById('new-player').querySelector('.colorpicker');

    // change the color picker color when the mouse moves over it
    this.el.addEventListener('mousemove', this._handleMouseMove.bind(this), false);

    // save the color when the colorpicker is clicked
    this.el.addEventListener('click', this._handleClick.bind(this), false);

    // show the picked color (if it exists) when the mouse leaves the color picker
    this.el.addEventListener('mouseleave', this._handleMouseLeave.bind(this), false);
  };

  Colorpicker.prototype._handleMouseMove = function(event) {
    var x = event.offsetX || (event.pageX - this.el.offsetLeft),
      y = event.offsetY || (event.pageY - this.el.offsetTop),
      hex = this._hexColorFromXY(x, y);

    this.el.style.background = hex;
  };

  Colorpicker.prototype._handleClick = function(event) {
    var x = event.offsetX || (event.pageX - this.el.offsetLeft),
      y = event.offsetY || (event.pageY - this.el.offsetTop),
      hex = this._hexColorFromXY(x, y);

    this.pickedColor = hex;

    this.renderer.setAccentColor(hex);

    this.playButton.style.borderColor = hex;
    this.playButton.style.color = hex;
  };

  Colorpicker.prototype._handleMouseLeave = function(event) {
    if (this.pickedColor) {
      var rgb = this.pickedColor;
      this.el.style.background = rgb;
    } else {
      this.el.style.background = 'rgba(255, 255, 255, 1)';
    }
  };

  Colorpicker.prototype._hexColorFromXY = function(x, y) {
    x = (x < 100) ? x / 2 : x;
    x = Math.floor(x) * 4;
    y = Math.floor(y) * 2;
    var z = parseInt(x.toString().slice(0, 2)) + parseInt(y.toString().slice(0, 2));

    // This function is inspired by the hex-from-int function
    // in Svbtle's awesome colorpicker.
    function hexFromValue(v) {
      var l = {
        10: 'A',
        11: 'B',
        12: 'C',
        13: 'D',
        14: 'E',
        15: 'F'
      };

      v = v.toString();

      if (v.length === 1) {
        return '0' + v;
      } else if (v.length === 3) {
        var n1 = v.slice(0, 2),
          n2 = v.slice(2, 3),
          n1 = l[n1] ? l[n1] : 'F';

        return n1 + n2;
      } else {
        return v;
      }
    }

    hex = '#' + hexFromValue(Math.floor(x / 2)) + hexFromValue(y) + hexFromValue(z);

    return hex;
  };

  return Colorpicker;
});