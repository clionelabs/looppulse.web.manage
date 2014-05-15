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

var processBeaconEvent = function(beaconEvent) {
  var visitor = new Visitor(beaconEvent.visitor_uuid);
  visitor.save();

  var beacon = new Beacon(beaconEvent.uuid, beaconEvent.major, beaconEvent.minor);
  beacon.save();

  var beaconEvent = new BeaconEvent(visitor, beacon, beaconEvent);
  beaconEvent.save();
}

var log = function(eventName, beaconEvent) {
  console.log(eventName + ' | Beacon ' + beaconEvent.major + ' : ' + beaconEvent.minor + ' | ' + beaconEvent);
}
