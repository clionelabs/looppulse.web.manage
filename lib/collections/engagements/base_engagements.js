// TODO replace Engagement with this class
/**
 *
 * @param doc
 * @constructor
 *
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

// Returns alertMessage and inAppAssetURL
BaseEngagement.prototype.customizedContext = function (recommendInstallationId) {
  return this.context[recommendInstallationId.toString()];
}

BaseEngagement.prototype.trigger = function (encounter) {
  var recommendInstallationId = Random.choice(this.recommendInstallationIds);
  var customizedContext = this.customizedContext(recommendInstallationId);

  // Create a new context which is unique to each of the recipient.
  var context = new EngagementContext(this._id, encounter.visitorId);
  context.alertMessage = customizedContext.alertMessage;
  context.inAppAssetURL = customizedContext.inAppAssetURL;
  context.save();

  context.deliver();
}
