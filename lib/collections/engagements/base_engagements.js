// TODO replace Engagement with this class
/**
 *
 * @param doc
 * @constructor
 *
 * @property {string} segmentId
 * @property {string} name
 * @property validPeriod
 * @property {string[]} triggerInstallationIds
 */
BaseEngagement = function(doc) {
  _.extend(this, doc);
};

BaseEngagement.prototype.atTriggerInstallation = function(encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)) {
    var isQualified = encounter.isQualified();
    if (!isQualified) {
      console.warn("[Engagement] "+this._id+" is rejected due to disqualified Encounter["+encounter._id+"]");
    }
    return isQualified;
  }
  return false;
};

BaseEngagement.prototype.recentlyStayedAt = function (visitorId, installationIds, enteredAtStart, enteredAtEnd, minDurationInMillisecond) {
  if (!installationIds || installationIds.length == 0) {
    return false;
  }

  var self = this;
  if (typeof minDurationInMillisecond === 'undefined'){
    minDurationInMillisecond = 1000; // For debug proposes to have a short min. duration
  }
  var previousVisit = Encounters.findOne({
    visitorId: visitorId,
    installationId: {$in: installationIds},
    enteredAt: {$gte: enteredAtStart, $lt: enteredAtEnd},
    duration: {$gte: minDurationInMillisecond}
  });
  return !!previousVisit;
}

BaseEngagement.prototype.customizedEngagementContext = function (encounter) {
  var recommendInstallationId = Random.choice(this.recommendInstallationIds);
  var context = this.context[recommendInstallationId.toString()];

  // Create a new context which is unique to each of the recipient.
  var engagementContext = new EngagementContext(this._id,
                                                encounter.visitorId,
                                                context.alertMessage,
                                                context.inAppAssetURL);
  engagementContext.save();
  return engagementContext;
}

BaseEngagement.prototype.trigger = function (encounter) {
  var engagementContext = this.customizedEngagementContext(encounter);
  engagementContext.deliver();
}
