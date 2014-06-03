Meteor.startup(
  Meteor.bindEnvironment(function(){
    configure();

    ensureIndexes();
    observerCompaniesFromFirebase();
    observeBeaconEventsFromFirebase();
  })
);
