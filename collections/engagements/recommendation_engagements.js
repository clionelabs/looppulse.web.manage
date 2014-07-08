RecommendationEngagement = function (doc) {
  _.extend(this, doc);
  this.type = RecommendationEngagement.type;
}
RecommendationEngagement.type = "recommendation";

RecommendationEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  var installation = Installations.findOne({ _id: encounter.installationId });
  if (!_.contains(self.triggerInstallationIds, installation._id)){
    return false;
  }

  return true;
}

RecommendationEngagement.prototype.trigger = function (encounter) {
  Message.deliver(encounter.visitorId, this.message, this._id);
}
