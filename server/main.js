Meteor.startup(
  Meteor.bindEnvironment(function(){
    configure();

    ensureIndexes();
    observeCompaniesFromFirebase();
    observeBeaconEventsFromFirebase();

    Encounter.startup();
    Engagement.startup();
  })
);
