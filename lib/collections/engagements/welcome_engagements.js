/**
 *
 * @param doc
 * @constructor
 *
 * @property {string} type - Always equal to "welcome"
 * @property {string} locationId
 * @property {string} message
 * @property {string[]} triggerInstallationIds
 */
WelcomeEngagement = function (doc) {
  _.extend(this, doc);
  this.type = WelcomeEngagement.type;
}
WelcomeEngagement.type = "welcome";

WelcomeEngagement.prototype.atTriggerInstallation = function (encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)){
    return true;
  }
  return false;
}

WelcomeEngagement.prototype.recentlyStayedAtTriggerInstallation = function (encounter, minDurationInMillisecond) {
  if (typeof minDurationInMillisecond === 'undefined'){
    minDurationInMillisecond = 60*1000;
  }

  var oneHour = 60*60*1000;
  // Only greet if the visitor hasn't visited this location in the last 8 hours.
  var previousVisit = encounter.findPrevious({
    millisecondsSinceEnteredAt: 8 * oneHour,
    minDuration: minDurationInMillisecond
  });
  return !!previousVisit;
}

// Send welcome message when it is the first encounter of the day.
WelcomeEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  if ( self.atTriggerInstallation(encounter) &&
      !self.recentlyStayedAtTriggerInstallation(encounter)) {
    return true;
  }
  return false;
}

WelcomeEngagement.prototype.trigger = function (encounter) {
  Message.deliver(encounter.visitorId, this.message, this._id);
}
