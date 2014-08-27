EngagementContexts = new Meteor.Collection('engagement_contexts', {
  transform: function(doc) {
    var obj = new EngagementContext(doc.engagementId, doc.visitorId);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 * - belongs to a {@link Engagement}
 * - belongs to a {@link Visitor}
 *
 * @param engagementId
 * @param visitorId
 * @constructor
 *
 * @property engagementId
 * @property visitorId
 * @property createdAt
 * @property alertMessage
 * @property inAppAssetURL
 */

EngagementContext = function(engagementId, visitorId) {
  this.engagementId = engagementId;
  this.visitorId = visitorId;
};

EngagementContext.prototype.save = function() {
  EngagementContexts.upsert(this, this);
}

EngagementContext.prototype.save = function () {
  var selector = {
    engagementId: this.engagementId,
    visitorId: this.visitorId
  };
  if (!this._id) {
    this.createdAt = (new Date).getTime();
  }
  var modifier = {
    $set: {
      alertMessage: this.alertMessage,
      inAppAssetURL: this.inAppAssetURL
    }
  };
  var result = EngagementContexts.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = EngagementContexts.findOne(selector)._id;
  }
  return this._id;
};

EngagementContext.prototype.deliver = function() {
  Message.deliver(this._id);
}
