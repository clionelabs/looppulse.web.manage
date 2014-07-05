Messages = new Meteor.Collection("messages");

Message = function (visitorId, body) {
  var self = this;
  self.visitorId = visitorId;
  self.body = body;
}

Message.prototype.save = function () {
  Messages.upsert(this,
                  { visitorId: this.visitorId,
                    body: this.body,
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
               "data": { "alert": self.body }};
  var options = { headers: headers, data: data };
  HTTP.post(url, options);

  self.save();
}
