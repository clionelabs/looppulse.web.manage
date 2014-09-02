configure();

Meteor.startup(
  Meteor.bindEnvironment(function() {
    Meteor.defer(function() {
      Benchmark.time("[Startup] configure",         configureDEBUG);
      Benchmark.time("[Startup] ensureIndexes",     ensureIndexes);
      Benchmark.time("[Startup] observeFirebase",   observeFirebase);
      Benchmark.time("[Startup] observeCollections",observeCollections);
    });
  })
);

var observeFirebase = function() {
  Benchmark.time("[Startup] observeBeaconEventsFromFirebase", observeBeaconEventsFromFirebase);
  Benchmark.time("[Startup] observeEngagementEventsFromFirebase", observeEngagementEventsFromFirebase);
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
