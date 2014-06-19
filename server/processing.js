// Observe raw event from Firebase
observeBeaconEventsFromFirebase = function() {
  var fbPath = Meteor.settings.firebase.root + '/beacon_events';
  var firebaseEventsRef = new Firebase(fbPath);
  console.log('[Remote] Observing: ' + fbPath);
  firebaseEventsRef.on(
    'child_added',
     Meteor.bindEnvironment(
       function(childSnapshot, prevChildName) {
         processBeaconEventFromFirebase(childSnapshot, Meteor.settings.removeFromFirebase);
         // console.log("processed: "+JSON.stringify(childSnapshot.val()));
       }
     )
  );
}

var processBeaconEventFromFirebase = function(snapshot, removeFromFirebase) {
  var beaconEventJSON = snapshot.val();
  console.log("[BeaconEvent] Processing", beaconEventJSON._id)
  var visitor = new Visitor(beaconEventJSON.visitor_uuid);
  visitor.save();

  var beacon = Beacons.findOne({uuid: beaconEventJSON.uuid,
                                major: beaconEventJSON.major,
                                minor: beaconEventJSON.minor});
  if (!beacon || !beacon._id) {
    console.warn("[BeaconEvent] can't find beacon: " + JSON.stringify(beaconEventJSON));
    return;
  }
  if (!visitor || !visitor._id) {
    console.warn("[BeaconEvent] can't find visitor ")
  }

  var beaconEvent = new BeaconEvent(visitor._id, beacon._id, beaconEventJSON);
  if (beaconEvent.save()) {
    // Remove the copy on Firebase so we will not re process the
    // beacon event on restart
    if (removeFromFirebase) {
      removeBeaconEventFromFirebase(snapshot.ref());
    }

    // Exit event marks the end of an encounter.
    if (beaconEvent.isExit()) {
      var installation = Installations.findOne({beaconId: beacon._id});
      if (!installation) {
        console.warn("[Beacon] Missing installation:", beacon)
        return;
      }
      var encounter = new Encounter(visitor._id, installation._id, beaconEvent.createdAt);
      encounter.save();

      var location = Location.load(installation.locationId);
      Metric.update(location, encounter, visitor);
    }
  }
}

var removeBeaconEventFromFirebase = function(beaconEventRef) {
  // beaconEventRef can be passed in as DataSnapshot
  var fbPath = new Firebase(beaconEventRef.toString());
  fbPath.remove();
  console.info('[BeaconEvent] Removed: ' + beaconEventRef);
}
