configure();

Meteor.startup(
  Meteor.bindEnvironment(function() {
    Meteor.defer(function() {
      console.time("[startup] configure");
      configureDEBUG();
      console.timeEnd("[startup] configure");

      console.time("[startup] ensureIndexes");
      ensureIndexes();
      console.timeEnd("[startup] ensureIndexes");

      observeFirebase();

      console.time("[startup] observeCollections");
      observeCollections();
      console.timeEnd("[startup] observeCollections");
    });
  })
);

var observeFirebase = function() {
  console.time("[startup] observeBeaconEventsFromFirebase");
  observeBeaconEventsFromFirebase();
  console.timeEnd("[startup] observeBeaconEventsFromFirebase");
  console.time("[startup] observeEngagementEventsFromFirebase");
  observeEngagementEventsFromFirebase();
  console.timeEnd("[startup] observeEngagementEventsFromFirebase");
};

var observeCollections = function() {
  var classes = [
    Encounter, Engagement, SegmentVisitor,
    EngagementMetric, InstallationMetric, ProductMetric
  ];
  classes.forEach(function(objectClass) {
    if (objectClass.hasOwnProperty('startup')) {
      objectClass.startup();
    }
  });
};
