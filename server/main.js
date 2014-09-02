configure();

Meteor.startup(
  Meteor.bindEnvironment(function() {
    Meteor.defer(function() {
      Benchmark.time(configureDEBUG, "[Startup] configure");
      Benchmark.time(ensureIndexes, "[Startup] ensureIndexes");
      Benchmark.time(observeFirebase, "[Startup] observeFirebase");
      Benchmark.time(observeCollections, "[Startup] observeCollections");
    });
  })
);

var observeFirebase = function() {
  Benchmark.time(observeBeaconEventsFromFirebase, "[Startup] observeBeaconEventsFromFirebase");
  Benchmark.time(observeEngagementEventsFromFirebase, "[Startup] observeEngagementEventsFromFirebase");
};

var observeCollections = function() {
  var classes = [
    Encounter, Engagement,
    EngagementMetric, InstallationMetric, ProductMetric
  ];
  classes.forEach(function(objectClass) {
    if (objectClass.hasOwnProperty('startup')) {
      objectClass.startup();
    }
  });
};
