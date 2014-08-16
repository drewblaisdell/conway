define([], function() {
  var Chat = function(app) {
    this.app = app;
    this.config = app.config;
    this.playerManager = app.playerManager;
    this.chatManager = app.chatManager;
    this.gameClient = app.gameClient;
  };

  Chat.prototype.init = function() {
    this.el = document.getElementById('chat');
    this.chatLogEl = document.getElementById('chat-log');
    this.newChatEl = document.getElementById('new-chat');

    this.newChatEl.addEventListener('keypress', this._handleKeypressOnNewChat.bind(this), false);
  };

  Chat.prototype.render = function() {
    var html = '',
      chatMessages = this.chatManager.getMessages();

    for (var i = chatMessages.length - 1; i >= 0; i--) {
      var chatMessage = chatMessages[i],
        player = chatMessage.player;

      if (typeof player === 'undefined') {
        return false;
      }

      html += '<div><div class="color" style="background: ' + player.color + ';"></div>';
      html += '<span class="name">' + player.name + ':</span>';
      html += chatMessage.message + '</div>';
    }

    this.chatLogEl.innerHTML = html;
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

  return Chat;
});