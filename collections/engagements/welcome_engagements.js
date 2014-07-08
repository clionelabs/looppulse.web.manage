WelcomeEngagement = function (doc) {
  _.extend(this, doc);
  this.type = WelcomeEngagement.type;
}
WelcomeEngagement.type = "welcome";

// Send welcome message when it is the first encounter of the day.
WelcomeEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  var installation = Installations.findOne({ _id: encounter.installationId });

  // Only greet at trigger installations
  if (!_.contains(self.triggerInstallationIds, installation._id)){
    return false;
  }

  // Only greet if the visitor hasn't visited this location in the last 8 hours.
  var eightHours = 8*60*60*1000;
  var longAgo = encounter.enteredAt - eightHours;
  var previous = Encounters.find({ visitorId: encounter.visitorId,
                                   enteredAt: { $gt: longAgo,
                                                $lt: encounter.enteredAt }});
  if (previous.count() > 0) {
    return false;
  }

  return true;
}

WelcomeEngagement.prototype.trigger = function (encounter) {
  Message.deliver(encounter.visitorId, this.message, this._id);
}
