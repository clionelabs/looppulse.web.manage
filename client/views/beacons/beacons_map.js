Template.beacons_map.helpers({
  events: function(beaconsCursor){
    if (!beaconsCursor) { return null }
    var beaconIds = beaconsCursor.map(function(o) { return o.beaconId; })
    var events = BeaconEvents.find({ beaconId: { $in: beaconIds },  type: "didRangeBeacons" })
    return events;
  },
  getCoord: function() {
    var padding = 45;
    var w = 583 - padding;
    var h = 425 - padding;
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
  events: function(){
    var lim = 300;
    var t = (new Date()).getTime();
    var qt = t - (10 * 60 * 1000); // js timestamp is in ms
    var events = BeaconEvents.find({ beaconId: this.beacon.beaconId,  type: "didRangeBeacons", createdAt: { $gt: qt } }, {limit: lim }).map(function(o, idx) {
      console.log(o._id, new Date(o.createdAt), idx)
      o.pos = idx +1
      o.delay = idx *1000 + 200
      return o;
    });
    return events;
  },
  attributes: function() {
    var attrs = {};
    attrs["class"] = "pulse";
    if (this._id) {
      attrs["class"] += " on"
    }
    return attrs;
  }
})