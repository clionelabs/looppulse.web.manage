// Observe raw event from Firebase
observeBeaconEventsFromFirebase = function() {
  observeCompanyChildAdded("beacon_events", function(childSnapshot, prevChildName) {
    processBeaconEventFromFirebase(childSnapshot, Meteor.settings.removeFromFirebase);
  });
};

observeEngagementEventsFromFirebase = function() {
  observeCompanyChildAdded("engagement_events", function(childSnapshot, prevChildName) {
    processEngagementEventFromFirebase(childSnapshot, Meteor.settings.removeFromFirebase);
  });
};

var observeCompanyChildAdded = function(path, callback) {
  var fbPath = Meteor.settings.firebase.root + '/' + path;
  var firebase = new Firebase(fbPath);
  console.log('[Remote] Observing: ' + fbPath);
  firebase.on('child_added', Meteor.bindEnvironment(callback));
};

var processEngagementEventFromFirebase = function(snapshot, removeFromFirebase) {
  var engagementEventJSON = snapshot.val();

  Message.markAsRead({
    _id: engagementEventJSON.message_id
  }, Date.parse(engagementEventJSON.created_at));

  if (removeFromFirebase) {
    snapshot.ref().remove();
  }
};

var processBeaconEventFromFirebase = function(snapshot, removeFromFirebase) {
  var beaconEventJSON = snapshot.val();
  var visitor = new Visitor(beaconEventJSON.visitor_uuid);
  visitor.save();
  // console.log("[processBeaconEventFromFirebase] Processing BeaconEvent["+beaconEventJSON._id+"] from Visitor["+visitor._id+"]");

  var beacon = Beacons.findOne({uuid: beaconEventJSON.uuid,
                                major: beaconEventJSON.major,
                                minor: beaconEventJSON.minor});
  if (!beacon || !beacon._id) {
    console.warn("[processBeaconEventFromFirebase] can't find beacon: " + JSON.stringify(beaconEventJSON));
    return;
  }

  var beaconEvent = new BeaconEvent(visitor._id, beacon._id, beaconEventJSON);
  if (beaconEvent.save()) {
    // Remove the copy on Firebase so we will not re process the
    // beacon event on restart
    if (removeFromFirebase) {
      removeBeaconEventFromFirebase(snapshot.ref());
    }
  }
}

var removeBeaconEventFromFirebase = function(beaconEventRef) {
  // beaconEventRef can be passed in as DataSnapshot
  var fbPath = new Firebase(beaconEventRef.toString());
  fbPath.remove();
}
