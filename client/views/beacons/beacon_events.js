Template.beacon_events.helpers({
  events: function(){
    var cursor = Installations.find({ locationId: this._id })
    var beacons = cursor.map(function(o) { return o.beaconId; })
    var events = BeaconEvents.find({ beaconId: { $in: beacons },  type: "didRangeBeacons" })
    // console.log("Querying", this._id, beacons, events)
    return events;
  },
  time: function(ts, tz){
    var d = new Date(ts)
    return d;
  }
});