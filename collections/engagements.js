Engagement = {};

Engagement.types = function () {
  return [WelcomeEngagement];
}

Engagement.dispatch = function (encounter) {
  // Determine which type of engagement this encounter should trigger.
  Engagement.types().forEach(
    function (engagementType) {
      if (engagementType.readyToTrigger(encounter)) {
        engagementType.trigger(encounter);
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
