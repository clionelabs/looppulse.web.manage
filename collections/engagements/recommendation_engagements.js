RecommendationEngagement = function (doc) {
  _.extend(this, doc);
  this.type = RecommendationEngagement.type;
}
RecommendationEngagement.type = "recommendation";

// Normally engagement can be based on:
// 1. Visit behavior: just left? shown interested in recommended locations before?
// 2. Real time environment: route visitor to less busy area
// 3. Time: recommend dessert after lunch hours
// 4. Purchase/loyalty: previous purchase history or information from loyalty program
RecommendationEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;

  // Behavior
  var readyToTriggerByVisit = function (encounter) {
    // We could consider using MongoDB selectors
    // http://docs.mongodb.org/manual/reference/operator/
    var installation = Installations.findOne({ _id: encounter.installationId });
    if (!_.contains(self.triggerInstallationIds, installation._id)){
      return false;
    }

    // Not ready if we have recently visited any of the to-be-recommended places.
    // var eightHours = 8*60*60*1000;
    // var longAgo = encounter.enteredAt - eightHours;
    var longAgo = 1000; // 1 second for debugging
    var previousVisits = Encounters.find({ visitorId: encounter.visitorId,
                                           enteredAt: { $gt: longAgo,
                                                        $lt: encounter.enteredAt },
                                           installationId: { $in: self.recommendInstallationIds } });
    if (previousVisits.count() > 0) {
      return false;
    }

    return true;
  }

  if (! readyToTriggerByVisit(encounter)) {
    return false;
  }
  return true;
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
