define([], function() {
  var ChatManager = function(app) {
    this.app = app;
    this.config = app.config;
    this.chatMessages = [];
    this.lastChatMessage = 0;
  };

  ChatManager.prototype.addMessage = function(player, message, timestamp) {
    var removing,
      chatMessage = {
      player: {
        name: player.name,
        color: player.color
      },
      message: message,
      timestamp: timestamp || Date.now()
    };

    if (!this.canAddMessage(message)) {
      return false;
    }

    this.chatMessages.push(chatMessage);

    if (this.chatMessages.length > this.config.chatLogLength) {
      removing = this.chatMessages.length - this.config.chatLogLength;

      this.chatMessages.splice(0, removing);
    }

    this.lastChatMessage = Date.now();

    return chatMessage;
  };

  ChatManager.prototype.canAddMessage = function(message) {
    return (message.length > 0 && message.length < this.config.chatMessageLength);
  };

  ChatManager.prototype.getMessages = function() {
    return this.chatMessages;
  };

  ChatManager.prototype.updateMessages = function(messages) {
    this.lastChatMessage = Date.now();
    
    if (typeof messages === 'undefined') {
      messages = [];
    }

    this.chatMessages = messages;
  };

  return ChatManager;
});