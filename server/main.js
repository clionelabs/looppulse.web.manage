Meteor.startup(
  Meteor.bindEnvironment(function () {
    Meteor.defer(function () {
      console.time("[startup] configure");
      configure();
      console.timeEnd("[startup] configure");

      console.time("[startup] ensureIndexes");
      ensureIndexes();
      console.timeEnd("[startup] ensureIndexes");
      console.time("[startup] observeCompaniesFromFirebase");
      observeCompaniesFromFirebase();
      console.timeEnd("[startup] observeCompaniesFromFirebase");
      console.time("[startup] observeBeaconEventsFromFirebase");
      observeBeaconEventsFromFirebase();
      console.timeEnd("[startup] observeBeaconEventsFromFirebase");

      console.time("[startup] Encounter");
      Encounter.startup();
      console.timeEnd("[startup] Encounter");
      console.time("[startup] Engagement");
      Engagement.startup();
      console.timeEnd("[startup] Engagement");
    });
  })
);
