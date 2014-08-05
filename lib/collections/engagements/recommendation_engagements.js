RecommendationEngagement = function (doc) {
  _.extend(this, doc);
  this.type = RecommendationEngagement.type;
}
RecommendationEngagement.type = "recommendation";

RecommendationEngagement.prototype.leavingTriggerInstallation = function (encounter) {
  if (encounter.isClosed() && this.atTriggerInstallation(encounter)){
    return true;
  }
  return false;
}

RecommendationEngagement.prototype.atTriggerInstallation = function (encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)){
    return true;
  }
  return false;
}

RecommendationEngagement.prototype.recentlyVisitedRecommendInstallation = function (encounter) {
  var self = this;
  // Not ready if we have recently visited any of the to-be-recommended places.
  var oneHour = 60*60*1000;
  var longAgo = encounter.enteredAt - oneHour;
  var previousVisit = encounter.findPrevious({
    after: longAgo,
    installationIds: self.recommendInstallationIds
  });
  return !!previousVisit;
}

RecommendationEngagement.prototype.readyToTriggerByVisit = function (encounter) {
  var self = this;
  if ( self.leavingTriggerInstallation(encounter) &&
      !self.recentlyVisitedRecommendInstallation(encounter)) {
    return true;
  }
  return false;
}

// Normally engagement can be based on:
// 1. Visit behavior: just left? shown interested in recommended locations before?
// 2. Real time environment: route visitor to less busy area
// 3. Time: recommend dessert after lunch hours
// 4. Purchase/loyalty: previous purchase history or information from loyalty program
RecommendationEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  if (self.readyToTriggerByVisit(encounter)) {
    return true;
  }
  return false;
}

RecommendationEngagement.prototype.customizedMessage = function (installationId) {
  // message was saved as a JSON.
  return this.message[installationId.toString()];
}

RecommendationEngagement.prototype.trigger = function (encounter) {
  var recommendInstallationId = Random.choice(this.recommendInstallationIds);
  Message.deliver(encounter.visitorId,
                  this.customizedMessage(recommendInstallationId),
                  this._id);
}
