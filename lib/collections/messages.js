Messages = new Meteor.Collection("messages", {
  transform: function(doc) {
    var obj = new Message(doc.visitorId, doc.body, doc.engagementId);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 *
 * @param visitorId
 * @param body
 * @param engagementId
 * @constructor
 *
 * @property visitorId
 * @property body
 * @property engagementId
 * @property createdAt
 * @property viewedAt
 * @property visitedAt
 */
Message = function(visitorId, body, engagementId) {
  var self = this;
  self.visitorId = visitorId;
  self.body = body;
  self.engagementId = engagementId;
};

Message.prototype.markAsRead = function(viewedAt) {
  this.viewedAt = (viewedAt ? viewedAt: (new Date).getTime());
};

Message.prototype.save = function () {
  var selector = {
    visitorId: this.visitorId,
    body: this.body,
    engagementId: this.engagementId
  };
  if (!this._id) {
    this.createdAt = (new Date).getTime();
  }
  var modifier = {
    $set: {
      createdAt: this.createdAt,
      viewedAt: this.viewedAt,
      visitedAt: this.visitedAt
    }
  };
  var result = Messages.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Messages.findOne(selector)._id;
  }
  return this._id;
};

// Using UUID as channel could generate invalid channel name.
// https://github.com/clionelabs/looppulse.ios.sdk/issues/3#issuecomment-48022164
Message.prototype.channels = function () {
  var visitor = Visitors.findOne({ _id: this.visitorId });
  var channel = "VisitorUUID_" + visitor.uuid;
  return [channel];
};

Message.prototype.dataToDeliver = function() {
  return {
    "channels": this.channels(),
    "data": {
      "alert": this.body,
      "engagement_id": this.engagementId,
      "message_id": this._id
    }
  };
};

Message.prototype.deliver = function () {
  var self = this;
  var url  = "https://api.parse.com/1/push";
  var headers = { "X-Parse-Application-Id": Meteor.settings.parse.applicationId,
                  "X-Parse-REST-API-Key": Meteor.settings.parse.restKey,
                  "Content-Type": "application/json"};
  var options = { headers: headers, data: self.dataToDeliver() };
  HTTP.post(url, options);
};

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
};

Message.deliver = function (visitorId, body, engagementId) {
  var message = new Message(visitorId, body, engagementId);
  if (! message.previouslySent()) {
    message.save();
    try {
      message.deliver();
    } catch (e) {
      Messages.remove(message._id);
    }
  }
};

Message.findUnread = function(selector, options) {
  var finalSelector = {
    viewedAt: {$not: {$type: 1}}
  };
  _.extend(finalSelector, selector);
  var message = Messages.findOne(finalSelector, options);
  return message;
};

Message.markAsRead = function(messageSelector, viewedAt) {
  var message = Message.findUnread(messageSelector);
  if (message) {
    message.markAsRead(viewedAt);
    message.save();
  } else {
    console.warn("Can not find message to mark as read:", messageSelector);
  }
};

Message.updateVisitedAt = function(encounter) {
  Messages.find({
    viewedAt: {
      $type: 1,
      $lt: encounter.enteredAt
    },
    visitedAt: {
      $not: { $type: 1 }
    }
  }).forEach(function(message) {
    console.info("[Message] Encounter[%s] by Message[%s]", encounter._id, message._id);
    message.visitedAt = encounter.enteredAt;
    message.save();
  });
};

Message.startup = function() {
  Encounters.find().observe({
    _suppress_initial: true,
    "added": function(encounter) { Message.updateVisitedAt(encounter); }
  });
  console.info("[Message] startup complete");
};
