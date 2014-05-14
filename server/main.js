// Observe raw event from Firebase
firebaseEventsRef = new Firebase('https://looppulse-dev.firebaseio.com/events');
firebaseEventsRef.on('child_added', Meteor.bindEnvironment(function(childSnapshot, prevChildName) {
  log(childSnapshot.val().event, childSnapshot.val());
  createEvent(childSnapshot.val());
}));

var createEvent = function(json) {
  var event = new Event(json);
  event.save();
}

var log = function(eventName, beaconEvent) {
  console.log(eventName + ' | Beacon ' + beaconEvent.major + ' : ' + beaconEvent.minor + ' | ' + beaconEvent.event);
}
