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

WelcomeEngagement.prototype.recentlyVisitedTriggerInstallation = function (encounter) {
  // Only greet if the visitor hasn't visited this location in the last 8 hours.
  var longAgo = WelcomeEngagement.longAgoDate(encounter.enteredAt);
  var previousVisit = encounter.findPrevious({
    after: longAgo
  });
  return !!previousVisit;
}

// Send welcome message when it is the first encounter of the day.
WelcomeEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  if ( self.atTriggerInstallation(encounter) &&
      !self.recentlyVisitedTriggerInstallation(encounter)) {
    return true;
  }
  return false;
}

WelcomeEngagement.prototype.trigger = function (encounter) {
  Message.deliver(encounter.visitorId, this.message, this._id);
}
