configure();

Visitors.find().map(function(visitor) {
  console.log("[Main]", visitor._id, SegmentVisitorFlows.getVisitorSegmentIdList(moment().valueOf()));
});
Segments.find().map(function(segment) {
  console.log("[Main]", segment._id, SegmentVisitorFlows.getSegmentVisitorIdList(moment().valueOf()));
});

Meteor.startup(
  Meteor.bindEnvironment(function() {
    Meteor.defer(function() {
      Benchmark.time(configureDEBUG, "[Startup] configure");
      Benchmark.time(ensureIndexes, "[Startup] ensureIndexes");
      Benchmark.time(observeFirebase, "[Startup] observeFirebase");
      Benchmark.time(observeCollections, "[Startup] observeCollections");
      Benchmark.time(Scheduler.startup, "[Startup] startScheduler");
    });
  })
);

var observeConfigFirebase = function() {
  // When using seedData, we won't need to observe changes from config server
  if (useSeedData()) {
    return;
  }

  var firebaseRef = new Firebase(Meteor.settings.firebase.config);
  firebaseRef.auth(Meteor.settings.firebase.configSecret, Meteor.bindEnvironment(function(error, result) {
    if (error) {
      console.error('Login Failed!', error);
    } else {
      console.info('Authenticated successfully with payload:', result.auth);
      console.info('Auth expires at:', new Date(result.expires * 1000));
      observeCompaniesFromFirebaseDEBUG();
    }
  }));
};

var observeFirebase = function () {
  observeConfigFirebase();
  observeAllEventsFromFirebase();
}

var observeCollections = function() {
  var classes = [
    Encounter, Engagement, SegmentVisitor, Metrics, SegmentVisitorFlow
  ];
  classes.forEach(function(objectClass) {
    if (objectClass.hasOwnProperty('startup')) {
      objectClass.startup();
    }
  });
};
