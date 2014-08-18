// TODO replace Engagement with this class
BaseEngagement = function(doc) {
  _.extend(this, doc);
};

BaseEngagement.prototype.atTriggerInstallation = function(encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)) {
    return true;
  }
  return false;
};
