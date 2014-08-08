Messages = new Meteor.Collection("messages");

Message = function (visitorId, body, engagementId) {
  var self = this;
  self.visitorId = visitorId;
  self.body = body;
  self.engagementId = engagementId;
}

Message.prototype.save = function () {
  Messages.upsert(this,
                  { visitorId: this.visitorId,
                    body: this.body,
                    engagementId: this.engagementId,
                    createdAt: (new Date).getTime()});
}

// Using UUID as channel could generate invalid channel name.
// https://github.com/clionelabs/looppulse.ios.sdk/issues/3#issuecomment-48022164
Message.prototype.channels = function () {
  var visitor = Visitors.findOne({ _id: this.visitorId });
  var channel = "VisitorUUID_" + visitor.uuid;
  return [channel];
}

Message.prototype.deliver = function () {
  var self = this;
  var url  = "https://api.parse.com/1/push";
  var headers = { "X-Parse-Application-Id": Meteor.settings.parse.applicationId,
                  "X-Parse-REST-API-Key": Meteor.settings.parse.restKey,
                  "Content-Type": "application/json"};
  var data = { "channels": self.channels(),
               "data": { "alert": self.body, "engagement_id": self.engagementId }};
  var options = { headers: headers, data: data };
  HTTP.post(url, options);
}

Message.prototype.previouslySent = function () {
  var oneHour = 60*60*1000;
  var now = (new Date).getTime();
  var longAgo = now - 8 * oneHour;
  var sameMessages = Messages.find({ visitorId: this.visitorId,
                                     body: this.body,
                                     engagementId: this.engagementId,
                                     createdAt: { $gt: longAgo,
                                                  $lt: now }});
  return (sameMessages.count() > 0);
}

Message.deliver = function (visitorId, body, engagementId) {
  var message = new Message(visitorId, body, engagementId);
  if (! message.previouslySent()) {
    message.deliver();
    message.save();
  }
}
