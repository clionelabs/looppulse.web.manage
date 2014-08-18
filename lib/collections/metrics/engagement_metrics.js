/**
 *
 * @param doc
 * @constructor
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
