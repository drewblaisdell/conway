define([], function() {
  var Chat = function(app) {
    this.app = app;
    this.config = app.config;
    this.playerManager = app.playerManager;
    this.chatManager = app.chatManager;
    this.gameClient = app.gameClient;
    this.activeTimestamp = false;
  };

  Chat.prototype.init = function() {
    this.el = document.getElementById('chat');
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

      html += '<div>'
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

        html += '<div class="timestamp">' + timestamp + '</div>';
      } else {
        html += '<div class="timestamp-missing"></div>';
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
    // close the old timestamp
    if (this.activeTimestamp) {
      this.activeTimestamp.className = 'timestamp';
      this.activeTimestamp = false;
    }
  };

  Chat.prototype._handleMouseOver = function(event) {
    if (event.target.className === 'name') {
      // the user is hovering over a name attached to a chat message
      var chatLine = event.target.parentElement,
        timestamp = chatLine.querySelector('.timestamp');

      // close the old timestamp
      if (this.activeTimestamp) {
        this.activeTimestamp.className = 'timestamp';
      }

      if (timestamp) {
        this.activeTimestamp = timestamp;
        timestamp.className = 'timestamp active';
      } else {
        this.activeTimestamp = false;
      }
    } else if (event.target.className !== 'timestamp active' && event.target.className !== 'color' && !(event.target.className !== '' || event.target.id !== 'new-chat')) {
      // close the old timestamp
      if (this.activeTimestamp) {
        this.activeTimestamp.className = 'timestamp';
        this.activeTimestamp = false;
      }
    }
  };

  return Chat;
});