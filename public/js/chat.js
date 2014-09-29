define(['lib/Autolinker.min'], function(Autolinker) {
  var Chat = function(app) {
    this.app = app;
    this.config = app.config;
    this.playerManager = app.playerManager;
    this.chatManager = app.chatManager;
    this.gameClient = app.gameClient;
    this.activeTimestamp = false;
    this.autolinker = Autolinker;
  };

  Chat.prototype.init = function() {
    this.el = document.getElementById('chat');
    this.timestampEl = document.getElementById('timestamp-tooltip');
    this.chatLogEl = document.getElementById('chat-log');
    this.newChatEl = document.getElementById('new-chat');

    this.newChatEl.addEventListener('keypress', this._handleKeypressOnNewChat.bind(this), false);
    this.el.addEventListener('mouseover', this._handleMouseOver.bind(this), false);
    this.el.addEventListener('mouseleave', this._handleMouseLeave.bind(this), false);
  };

  Chat.prototype.render = function() {
    var html = '',
      chatMessages = this.chatManager.getMessages();

    for (var i = 0; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i],
        player = chatMessage.player,
        timestampExists = chatMessage.timestamp !== undefined,
        timestamp = '',
        nightOrDay = 'am',
        hours,
        minutes,
        d;

      chatMessage.message = this.autolinker.link(chatMessage.message, {
        stripPrefix: false,
        twitter: false
      });

      if (timestampExists) {
        d = new Date(chatMessage.timestamp);
        hours = d.getHours();
        minutes = d.getMinutes();

        if (hours > 12) {
          hours -= 12;
          nightOrDay = 'pm';
        }

        if (minutes < 10) {
          minutes = '0' + minutes;
        }

        timestamp = hours + ':' + minutes + nightOrDay;

        html += '<div class="chat-message" data-timestamp="' + timestamp + '">';
      } else {
        html += '<div class="chat-message">';
      }

      html += '<div class="color" style="background: ' + player.color + ';"></div>';
      html += '<span class="name">' + player.name + ':</span>';
      html += '<span class="message">'+ chatMessage.message + '</span>';
      html += '</div>';
    }

    this.chatLogEl.innerHTML = html;
    this.scrollToBottom();
  };

  Chat.prototype.scrollToBottom = function() {
    this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
  };

  Chat.prototype.showNewChatBox = function() {
    this.newChatEl.style.display = 'block';
  };

  Chat.prototype._handleKeypressOnNewChat = function(event) {
    var chatMessage,
      key = event.which || event.keyCode;

    if (key === 13) {
      chatMessage = this.newChatEl.value;

      if (this.chatManager.canAddMessage(chatMessage)) {
        this.newChatEl.value = '';

        this.gameClient.sendChatMessage(chatMessage);
      } else {

      }
    }
  };

  Chat.prototype._handleMouseLeave = function(event) {
    this.timestampEl.className = '';
  };

  Chat.prototype._handleMouseOver = function(event) {
    var timestamp = event.target.dataset.timestamp || event.target.parentElement.dataset.timestamp,
      chatMessageEl = (event.target.dataset.timestamp) ? event.target : event.target.parentElement;

    if (timestamp) {
      if (this.timestampEl.className === '') {
        this.timestampEl.className = 'active';
      }
      this.timestampEl.innerHTML = timestamp;

      var timestampTop = chatMessageEl.offsetTop - this.chatLogEl.scrollTop - 3,
        timestampLeft = chatMessageEl.offsetLeft - 50;

      if (timestampTop < this.chatLogEl.offsetTop - 10) {
        this.timestampEl.className = '';
      } else {
        this.timestampEl.style.top = chatMessageEl.offsetTop - this.chatLogEl.scrollTop - 3 + 'px';
        this.timestampEl.style.left = chatMessageEl.offsetLeft - 50 + 'px';
      }
    } else {
      this.timestampEl.className = '';
    }
  };

  return Chat;
});