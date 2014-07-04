Messages = new Meteor.Collection("messages");

Message = function (visitorId, body, actionUrl) {
  var self = this;
  self.visitorId = visitorId;
  self.body = body;
  self.actionUrl = actionUrl;
}

Message.prototype.channels = function() {
  var visitor = Visitors.findOne({ _id: this.visitorId });
  return [visitor.uuid];
}

Message.prototype.deliver = function () {
  var self = this;
  Parse.Push.send({
    channels: self.channels(),
    data: {
      alert: self.body
    }
  }, {
    success: function () {
      console.info("[Message] delivered: " + self.body);
    },
    error: function () {
      console.info("[Message] failed to deliver: " + self.body + " with error: " + error);
    }
  });
}

Message.startup = function () {
  Parse.initialize(Meteor.settings.parse.applicationId, 
                   Meteor.settings.parse.javascriptKey);
}
