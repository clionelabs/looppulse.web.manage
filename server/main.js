Meteor.startup(
  Meteor.bindEnvironment(function(){
    configure();

    ensureIndexes();
    observeBeaconEventsFromFirebase();
  })
);
