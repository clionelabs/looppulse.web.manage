Logs = new Meteor.Collection("logs");

var logEncounter = function (encounter) {
  var visitor = Visitors.findOne({ _id: encounter.visitorId });
  var fbPath = Meteor.settings.firebase.root;
  fbPath += "/visitors/" + visitor.uuid + "/logs";
  var visitorRef = new Firebase(fbPath);

  var installation = Installations.findOne({ _id: encounter.installationId });
  var location = Locations.findOne({ _id: installation.locationId });
  var data = { "type": "visit",
               "location": location.name,
               "enteredAt": encounter.enteredAt,
               "exitedAt": encounter.exitedAt,
               "durationInSeconds": encounter.duration/1000 };
  visitorRef.push(data);
};

Encounters.find().observe({
  "added": function (newDoc) { logEncounter(newDoc); }
});
