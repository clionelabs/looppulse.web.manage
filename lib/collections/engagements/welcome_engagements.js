/**
 *
 * @param doc
 * @constructor
 * @augments BaseEngagement
 *
 * @property {string} type - Always equal to "welcome"
 * @property {string} locationId
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
  // Create a new context which is unique to each of the recipient.
  var context = new EngagementContext(this._id, encounter.visitorId);
  context.alertMessage = this.message;
  context.save();

  context.deliver();
}
