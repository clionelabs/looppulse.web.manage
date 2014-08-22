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
