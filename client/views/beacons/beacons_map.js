Template.beacons_map.helpers({
  events: function(beaconsCursor){
    if (!beaconsCursor) { return null }
    var beaconIds = beaconsCursor.map(function(o) { return o.beaconId; })
    var events = BeaconEvents.find({ beaconId: { $in: beaconIds },  type: "didRangeBeacons" })
    // console.log("Querying", this._id, beacons, events)
    return events;
  },
  getCoord: function() {
    var padding = 45;
    var w = 583 - padding;
    var h = 425 - padding;
    console.log("Beacon", this)
    return { x: Template.beacons_map.randInt(padding, w), y: Template.beacons_map.randInt(padding, h) };
  },
  time: function(ts, tz){
    var d = new Date(ts)
    return d;
  },
  randInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});
Template.beacons_map_marker.helpers({

  attributes: function() {
    var t = (new Date()).getTime()
    var lastLoad = null
    console.log("Last Update At", lastLoad)
    var q = { beaconId: this.beacon.beaconId,  type: "didRangeBeacons" }

    if(lastLoad)
      q.createdAt = { $gt: lastLoad }

    console.log(q)
    var events = BeaconEvents.find(q);
    var attrs = {};
    attrs["class"] = "pulse";
    if (events.count() > 0) {
      attrs["class"] += " on"
    }
    return attrs;
  }
})