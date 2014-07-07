Engagement = {};

Engagement.types = function (locationId) {
  return WelcomeEngagements.find({ locationId: locationId });
}

Engagement.dispatch = function (encounter) {
  // Determine which type of engagement this encounter should trigger.
  var installation = Installations.findOne({_id: encounter.installationId });
  var locationId = installation.locationId;
  Engagement.types(locationId).forEach(
    function (engagement) {
      if (engagement.readyToTrigger(encounter)) {
        engagement.trigger(encounter);
      }
    }
  )
}

Engagement.startup = function () {
  Encounters.find().observe({
    "added": function(encounter) { Engagement.dispatch(encounter); }
  });
  console.info("[Engagement] startup complete");
}
