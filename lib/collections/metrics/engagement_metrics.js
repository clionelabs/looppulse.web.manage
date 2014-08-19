/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property engagementId
 * @property sentMessageCount
 * @property viewedMessageCount
 * @property visitedCount
 * @property locationId  - Denormalized from Engagement
 */
EngagementMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = EngagementMetric.type;
};

EngagementMetric.prototype = Object.create(BaseMetric.prototype);
EngagementMetric.prototype.constructor = EngagementMetric;

EngagementMetric.type = "engagement";

EngagementMetric.find = function(selector) {
  var finalSelector = {type: EngagementMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

EngagementMetric.startup = function() {
  Encounters.find().observe({
    _suppress_initial: true,
    "added": handleEncounterAdded
  });
  Messages.find().observe({
    _suppress_initial: true,
    "added": handleMessageAdded,
    "changed": handleMessageChanged
  });
};

var incrementCounter = function(engagementId, counterField, amount) {
  var selector = {
    type: EngagementMetric.type,
    engagementId: engagementId
  };

  // Denormalize locationId
  var engagement = Engagements.findOne(selector.engagementId);
  var modifier = { $set: { locationId: engagement.locationId } };
  modifier["$inc"] = {};
  modifier["$inc"][counterField] = amount;

  return Metrics.upsert(selector, modifier);
};

var handleEncounterAdded = function(encounter) {
  var installation = Installations.findOne({_id: encounter.installationId });
  var locationId = installation.locationId;
  Engagement.availableEngagements(locationId).forEach(function(engagement) {
    var oneHour = 60 * 60 * 1000;
    var now = (new Date).getTime();
    var longAgo = now - 8 * oneHour;
    var messageCount = Messages.find({
      engagementId: engagement._id,
      visitorId: encounter.visitorId,
      createdAt: { $gt: longAgo } }).count();
    if (messageCount > 0) {
      incrementCounter(engagement._id, "visitedCount", 1);
    }
  });
};

var handleMessageAdded = function(message) {
  incrementCounter(message.engagementId, "sentMessageCount", 1);
};

var handleMessageChanged = function(message, oldMessage) {
  if (message.viewedAt && !oldMessage.visitedAt) {
    incrementCounter(message.engagementId, "viewedMessageCount", 1);
  }
};
