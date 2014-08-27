/**
 *
 * @param doc
 * @constructor
 * @augments BaseEngagement
 *
 * @property {string} type - Always equal to "recommendation"
 * @property {string[]} message
 * @property {string} locationId
 * @property {string[]} triggerInstallationIds
 * @property {string[]} recommendInstallationIds
 */
RecommendationEngagement = function(doc) {
  BaseEngagement.call(this, doc);
  this.type = RecommendationEngagement.type;
};

RecommendationEngagement.type = "recommendation";

RecommendationEngagement.prototype = Object.create(BaseEngagement.prototype);
RecommendationEngagement.prototype.constructor = RecommendationEngagement;

RecommendationEngagement.prototype.leavingTriggerInstallation = function (encounter) {
  if (encounter.isClosed() && this.atTriggerInstallation(encounter)){
    return true;
  }
  return false;
}

RecommendationEngagement.prototype.recentlyStayedAtRecommendInstallation = function (encounter, minDurationInMillisecond) {
  if (typeof minDurationInMillisecond === 'undefined'){
    minDurationInMillisecond = 60*1000;
  }

  var self = this;
  // Not ready if we have recently visited any of the to-be-recommended places.
  var oneHour = 60*60*1000;
  var previousVisit = encounter.findPrevious({
    millisecondsSinceEnteredAt: oneHour,
    installationIds: self.recommendInstallationIds,
    minDuration: minDurationInMillisecond
  });
  return !!previousVisit;
}

RecommendationEngagement.prototype.readyToTriggerByStay = function (encounter) {
  var self = this;
  if ( self.leavingTriggerInstallation(encounter) &&
      !self.recentlyStayedAtRecommendInstallation(encounter)) {
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
  if (self.readyToTriggerByStay(encounter)) {
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

  // Create a new context which is unique to each of the recipient.
  var context = new EngagementContext(this._id, encounter.visitorId);
  context.alertMessage = this.customizedMessage(recommendInstallationId);
  context.inAppAssetURL = "http://apple.com";
  context.save();

  context.deliver();
}
