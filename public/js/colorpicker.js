define([], function() {
  var Colorpicker = function(app) {
    this.app = app;
    this.config = app.config;
    this.renderer = app.renderer;

    this.pickedColor = false;
  };

  Colorpicker.prototype.colorWasPicked = function() {
    return (this.pickedColor !== false);
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
    var x, y, hex;

    if (event.offsetX && event.offsetY) {
      x = event.offsetX;
      y = event.offsetY; 
    } else {
      var rect = this.el.getBoundingClientRect();

      x = event.pageX - rect.left - window.scrollX;
      y = event.pageY - rect.top - window.scrollY;
    }

    hex = this._hexColorFromXY(x, y);

    this.el.style.background = hex;
  };

  Colorpicker.prototype._handleClick = function(event) {
    var x, y, hex;

    if (event.offsetX && event.offsetY) {
      x = event.offsetX;
      y = event.offsetY; 
    } else {
      var rect = this.el.getBoundingClientRect();

      x = event.pageX - rect.left - window.scrollX;
      y = event.pageY - rect.top - window.scrollY;
    }

    hex = this._hexColorFromXY(x, y);
    
    this.pickedColor = hex;

    this.renderer.setAccentColor(hex);

    this.playButton.style.borderColor = hex;
    this.playButton.style.color = hex;

    this.renderer.setFaviconColor(hex);

    // select the name box
    this.renderer.nameInput.focus();
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
    var hue = (x / 194),
      sat = (y / 100),
      lit = .5,
      rgb,
      hex;

    if (sat < .3) {
      sat = .3 + (.3 - sat);
      lit = (x + y) / 294;
    }

    function HSLtoRGB(h, s, l){
      var r, g, b;

      if (s == 0) {
        r = g = b = l; // achromatic
      } else {
        function hue2rgb(p, q, t) {
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    rgb = HSLtoRGB(hue, sat, lit);
    hex = '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

    return hex;
  };

  return Colorpicker;
});