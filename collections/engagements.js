Engagements = new Meteor.Collection("engagements", {
  transform: function (doc) {
    if (doc.type === WelcomeEngagement.type) {
      return new WelcomeEngagement(doc);
    } else if (doc.type === RecommendationEngagement.type) {
      return new RecommendationEngagement(doc);
    }
    return doc;
  }
});

Engagement = {};

Engagement.availableEngagements = function (locationId) {
  return Engagements.find({ locationId: locationId });
}

Engagement.dispatch = function (encounter) {
  // Determine which type of engagement this encounter should trigger.
  var installation = Installations.findOne({_id: encounter.installationId });
  var locationId = installation.locationId;
  Engagement.availableEngagements(locationId).forEach(
    function (engagement) {
      if (engagement.readyToTrigger(encounter)) {
        console.info("[Engagement] Ready to trigger "+engagement.type+" Engagement["+engagement._id+"] on Visitor["+encounter.visitorId+"] due to Encounter["+encounter._id+"]");
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
