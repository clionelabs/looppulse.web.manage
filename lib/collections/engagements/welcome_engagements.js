WelcomeEngagement = function (doc) {
  _.extend(this, doc);
  this.type = WelcomeEngagement.type;
}
WelcomeEngagement.type = "welcome";

WelcomeEngagement.longAgoDate = function (currentDate) {
  var oneHour = 60*60*1000;
  var longAgo = currentDate - 8 * oneHour;
  return longAgo;
}

WelcomeEngagement.prototype.atTriggerInstallation = function (encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)){
    return true;
  }
  return false;
}

WelcomeEngagement.prototype.recentlyStayedAtTriggerInstallation = function (encounter, minDurationInMillisecond) {
  minDurationInMillisecond = minDurationInMillisecond || 60*1000;

  // Only greet if the visitor hasn't visited this location in the last 8 hours.
  var previousVisit = encounter.findPrevious({
    after: WelcomeEngagement.longAgoDate(encounter.enteredAt),
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
