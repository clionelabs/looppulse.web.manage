Messages = new Meteor.Collection("messages", {
  transform: function(doc) {
    var obj = new Message(doc.engagementContextId);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 *
 * @param engagementContextId
 * @constructor
 *
 * @property engagementContextId
 * @property createdAt
 * @property viewedAt
 */
Message = function(engagementContextId) {
  this.engagementContextId = engagementContextId;
};

Message.prototype.markAsRead = function(viewedAt) {
  this.viewedAt = (viewedAt ? viewedAt: (new Date).getTime());
};

Message.prototype.save = function () {
  var selector = {
    engagementContextId: this.engagementContextId
  };
  if (!this._id) {
    this.createdAt = (new Date).getTime();
  }
  var modifier = {
    $set: {
      engagementContextId: this.engagementContextId,
      createdAt: this.createdAt,
      viewedAt: this.viewedAt
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
  var engagementContext = EngagementContexts.findOne({ _id:this.engagementContextId });
  var visitor = Visitors.findOne({ _id: engagementContext.visitorId });
  var channel = "VisitorUUID_" + visitor.uuid;
  return [channel];
};

Message.prototype.dataToDeliver = function() {
  var engagementContext = EngagementContexts.findOne({_id:this.engagementContextId});
  return {
    "channels": this.channels(),
    "data": {
      "alert": engagementContext.alertMessage,
      "engagement_url": engagementContext.inAppAssetURL,
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
  var sameMessages = Messages.find({ engagementContextId: this.engagementContextId,
                                     createdAt: { $gt: longAgo,
                                                  $lt: now }});
  return (sameMessages.count() > 0);
};

Message.deliver = function (engagementContextId) {
  var message = new Message(engagementContextId);
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
