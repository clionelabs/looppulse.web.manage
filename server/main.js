configure();

Meteor.startup(
  Meteor.bindEnvironment(function () {
    Meteor.defer(function () {
      console.time("[startup] configure");
      configureDEBUG();
      console.timeEnd("[startup] configure");

      console.time("[startup] ensureIndexes");
      ensureIndexes();
      console.timeEnd("[startup] ensureIndexes");

      observeFirebase();
      observeCollections();
    });
  })
);

var observeFirebase = function() {
  console.time("[startup] observeCompaniesFromFirebase");
  observeCompaniesFromFirebase();
  console.timeEnd("[startup] observeCompaniesFromFirebase");
  console.time("[startup] observeBeaconEventsFromFirebase");
  observeBeaconEventsFromFirebase();
  console.timeEnd("[startup] observeBeaconEventsFromFirebase");
  console.time("[startup] observeEngagementEventsFromFirebase");
  observeEngagementEventsFromFirebase();
  console.timeEnd("[startup] observeEngagementEventsFromFirebase");
};

var observeCollections = function() {
  console.time("[startup] Encounter");
  Encounter.startup();
  console.timeEnd("[startup] Encounter");
  console.time("[startup] Engagement");
  Engagement.startup();
  console.timeEnd("[startup] Engagement");
  console.time("[startup] Message");
  Message.startup();
  console.timeEnd("[startup] Message");
};
