/**
 *
 * @param doc
 * @constructor
 * @augments BaseEngagement
 *
 * @property {string} type - Always equal to "welcome"
 * @property {string} locationId
 * @property {string} segmentId
 * @property {string} name
 * @property validPeriod
 * @property {string} message
 * @property {string[]} triggerInstallationIds
 */
WelcomeEngagement = function(doc) {
  BaseEngagement.call(this, doc);
  this.type = WelcomeEngagement.type;
};

WelcomeEngagement.type = "welcome";

WelcomeEngagement.prototype = Object.create(BaseEngagement.prototype);
WelcomeEngagement.prototype.constructor = WelcomeEngagement;

WelcomeEngagement.prototype.recentlyStayedAtTriggerInstallation = function (encounter, minDurationInMillisecond) {
  var self = this;
  // only greet if visitor hasn't visited this location in the last 8 hours
  var eightHours = 8*60*60*1000;
  var enteredAtStart = encounter.enteredAt - eightHours, enteredAtEnd = encounter.enteredAt;
  return self.recentlyStayedAt(encounter.visitorId,
                               self.triggerInstallationIds,
                               enteredAtStart,
                               enteredAtEnd,
                               minDurationInMillisecond);
}

// Send welcome message when it is the first encounter of the day.
WelcomeEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  if (self.isReady() &&
      self.enteringTriggerInstallations(encounter) &&
      !self.recentlyStayedAtTriggerInstallation(encounter)) {
    return true;
  }
  return false;
}
