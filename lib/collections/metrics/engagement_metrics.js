EngagementMetrics = {};

EngagementMetrics.find = function(selector) {
  var finalSelector = {type: EngagementMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

EngagementMetrics.findOne = function(selector) {
  var finalSelector = {type: EngagementMetric.type};
  _.extend(finalSelector, selector);
  var metric = Metrics.findOne(finalSelector);
  if (!metric && selector.engagementId) {
    metric = new EngagementMetric({
      engagementId: selector.engagementId,
      sentMessageCount: 0,
      viewedMessageCount: 0,
      visitedCount: 0
    });
  }
  return metric;
};

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

EngagementMetric.prototype.conversionRates = function() {
  return {
    sentMessageToViewed: BaseMetric.calculateConversionRate(this.sentMessageCount, this.viewedMessageCount),
    sentMessageToVisited: BaseMetric.calculateConversionRate(this.sentMessageCount, this.visitedCount),
    viewedMessageToVisited: BaseMetric.calculateConversionRate(this.viewedMessageCount, this.visitedCount)
  };
};

EngagementMetric.type = "engagement";

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

var upsertEngagementMetric = function(aSelector, aModifier) {
  var selector = {
    type: EngagementMetric.type
  };
  _.extend(selector, aSelector);

  // Denormalize locationId
  var engagement = Engagements.findOne(selector.engagementId);
  var modifier = {
    $set: { locationId: engagement.locationId }
  };
  _.extend(modifier, aModifier);

  return Metrics.upsert(selector, modifier);
};

var incrementCounter = function(engagementId, counterField, amount) {
  var selector = {engagementId: engagementId};
  var modifier = { $inc: {} };
  modifier["$inc"][counterField] = amount;
  return upsertEngagementMetric(selector, modifier);
};

var handleEncounterAdded = function(encounter) {
  var installation = Installations.findOne({_id: encounter.installationId });
  var locationId = installation.locationId;
  Engagements.availableEngagements(locationId).forEach(function(engagement) {
    var engagementContext = EngagementContexts.findOne({engagementId:engagement._id,
                                                        visitorId:encounter.visitorId});
    var hasMessage = false;
    var oneHour = 60 * 60 * 1000;
    var now = (new Date).getTime();
    var longAgo = now - 8 * oneHour;
    if (engagementContext) {
      hasMessage = Messages.findOne({
        engagementContextId: engagementContext._id,
        createdAt: { $gt: longAgo } });
    }
    var modifier = {
      $setOnInsert: {
        sentMessageCount: 0,
        viewedMessageCount: 0,
        visitedCount: 0
      }
    };
    if (hasMessage) {
      // Query with $nin, which cause error when using with upsert()
      var isNewVisitor = EngagementMetrics.find({
        engagementId: engagement._id,
        visitors: { $in: [ encounter.visitorId ] }}).count() === 0;
      if (isNewVisitor) {
        modifier = {
          $inc: { visitedCount: 1 },
          $addToSet: { visitors: encounter.visitorId }
        };
      }
    }
    upsertEngagementMetric({engagementId: engagement._id}, modifier);
  });
};

var handleMessageAdded = function(message) {
  var engagementContext = EngagementContexts.findOne({_id: message.engagementContextId});
  incrementCounter(engagementContext.engagementId, "sentMessageCount", 1);
};

var handleMessageChanged = function(message, oldMessage) {
  var engagementContext = EngagementContexts.findOne({_id: message.engagementContextId});
  if (message.viewedAt && !oldMessage.visitedAt) {
    incrementCounter(engagementContext.engagementId, "viewedMessageCount", 1);
  }
};
