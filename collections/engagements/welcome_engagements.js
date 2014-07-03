WelcomeEngagement = {};

// Send welcome message when it is the first encounter of the day.
WelcomeEngagement.readyToTrigger = function (encounter) {
  // TODO: Use Meteor.Collection#transform to return an encounter object #52
  var installation = Installation.load({ _id: encounter.installationId });

  // Only greet at entrance
  if (!installation.isEntrance()) {
    return false;
  }

  // Only greet if the visitor hasn't visited this location in the last 8 hours.
  var eightHours = 8*60*60*1000;
  var longAgo = encounter.enteredAt - eightHours;
  var previous = Encounters.find({ visitorId: encounter.visitorId,
                                   enteredAt: {$gt: longAgo,
                                               $lt: encounter.enteredAt}});
  if (previous.count() > 0) {
    return false;
  }

  return true;
}

WelcomeEngagement.trigger = function (encounter) {
  var visitor = Visitors.findOne({_id: encounter.visitorId});
  console.info("[Engagement] Triggering WelcomeEngagement for Encounter["+encounter._id+"] from Visitor["+visitor.uuid+" (uuid)]");
}
