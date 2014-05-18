// Observe raw event from Firebase
firebaseEventsRef = new Firebase('https://looppulse-dev.firebaseio.com/beacon_events');
firebaseEventsRef.on(
  'child_added',
   Meteor.bindEnvironment(
     function(childSnapshot, prevChildName) {
       log(childSnapshot.val().type, childSnapshot.val());
       processBeaconEvent(childSnapshot.val());
     }
   )
);

var processBeaconEvent = function(beaconEventJSON) {
  var visitor = new Visitor(beaconEventJSON.visitor_uuid);
  visitor.save();

  var beacon = new Beacon(beaconEventJSON.uuid, beaconEventJSON.major, beaconEventJSON.minor);
  beacon.save();

  var beaconEvent = new BeaconEvent(visitor, beacon, beaconEventJSON);
  // ignore unknown proximity event
  if (beaconEvent.proximity && beaconEvent.proximity=='unknown') {
    console.log("Ignore unknown proximity event! " + JSON.stringify(beaconEvent));
    return;
  }
  beaconEvent.save();

  var encounter = new Encounter(visitor._id, beacon._id, beaconEvent.type, beaconEvent.createdAt);
  encounter.saveIfExit();
}

var log = function(eventName, beaconEvent) {
  console.log(eventName + ' | Beacon ' + beaconEvent.major + ' : ' + beaconEvent.minor + ' | ' + beaconEvent);
}
