Template.beacons_map.helpers({
  events: function(beaconsCursor){
    if (!beaconsCursor) { return null }
    var beaconIds = beaconsCursor.map(function(o) { return o.beaconId; })
    var events = BeaconEvents.find({ beaconId: { $in: beaconIds },  type: "didRangeBeacons" })
    return events;
  },
  getCoord: function() {
    var _x = this.coord.x;
    var _y = this.coord.y;
    return { x: _x, y: _y };
  },
  time: function(ts, tz){
    var d = new Date(ts)
    return d;
  }
});
Template.beacons_map_marker.helpers({
  events: function(){
    var config = Meteor.settings.public.view.beaconsMap || {};
    var lim = config.limit || 10;
    var t = (new Date()).getTime();
    var qt = t - (config.forwardBufferInSec * 60 * 1000); // js timestamp is in ms
    var beaconId = this.beacon.beaconId
    //console.log("Processing", beaconId, this.beacon)
    var events = BeaconEvents.find({ beaconId: beaconId,  type: "didRangeBeacons", createdAt: { $gt: qt } }, {limit: lim });
    console.log("Events Received", events.count())
    jQuery('.beacon-map').trigger("beacon-set", beaconId)
    return events;
  }
})
Template.beacons_map.rendered = function(){
  // console.log(this)
  var self = this;
  self.marker = 0;

  var pulsing = function() {
    var beaconId = "";
    var $elem = null;
    if (arguments.length == 2) {
      beaconId = arguments[0]
      $elem = $("[data-beacon-id='"+beaconId+"']", arguments[1])
    } else {
      $elem = $(arguments[0])
      beaconId = $elem.data("beacon-id")
    }
    // console.log("beacon set.", beaconId)
    if($elem.size() > 0){
      // console.log("Rendered, trigger animation...")
      $elem.find(".pulse.queued").first().addClass("on")
    }else{
      // console.log("DOM not ready")
    }
  }

  $('.beacon-map').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', '.beacon-marker', function(e){
    //target: ring
    //current target: marker
    //delegate: map
    var marker = e.currentTarget;
    $(".on", marker).remove();
    pulsing(marker)
  }).on("beacon-set beacon-rendered", function(e, beaconId){
    pulsing(beaconId, e.target)
  });
}

Template.beacons_map_marker.rendered = function(){
  //console.log("marker rendered", this.data.beacon.beaconId)
  var beaconId = this.data.beacon.beaconId;
  jQuery('.beacon-map').trigger("beacon-rendered", beaconId)
}