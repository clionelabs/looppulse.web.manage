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
    return encounter.isQualified();
  }
  return false;
};

BaseEngagement.prototype.customizedEngagementContext = function (encounter) {
  var recommendInstallationId = Random.choice(this.recommendInstallationIds);
  var context = this.context[recommendInstallationId.toString()];

  // Create a new context which is unique to each of the recipient.
  var engagementContext = new EngagementContext(this._id,
                                                encounter.visitorId,
                                                context.alertMessage,
                                                context.inAppAssetURL);
  context.save();
  return context;
}

BaseEngagement.prototype.trigger = function (encounter) {
  var engagementContext = this.customizedEngagementContext(encounter);
  engagementContext.deliver();
}
