Template.beacons_map.helpers({
  events: function(beaconsCursor){
    if (!beaconsCursor) { return null }
    var beaconIds = beaconsCursor.map(function(o) { return o.beaconId; })
    var events = BeaconEvents.find({ beaconId: { $in: beaconIds },  type: "didRangeBeacons" })
    return events;
  },
  getCoord: function() {
    // console.log(this)
    var _x = this.coord.x;
    var _y = this.coord.y;
    return { x: _x, y: _y };
  },
  time: function(ts, tz){
    var d = new Date(ts)
    return d;
  }
});
Template.beacons_map.rendered = function(){

}
Template.beacons_map_marker.prefix = "beacon-";
Template.beacons_map_marker.owlMode = true;
Template.beacons_map_marker.created = function(){

  //jQuery('.beacon-map').trigger("beacon-set", beaconId)
};
Template.beacons_map_marker.rendered = function(){
  this.domReady = true;
  this.processing = false;
  //console.log("marker rendered", this.data.beacon.beaconId)
  //jQuery('.beacon-map').trigger("beacon-rendered", beaconId)
  var beaconId = this.data.beacon.beaconId
  //console.log("Setting Up Query Listener", this, beaconId)
  var config = Meteor.settings.public.view.beaconsMap || {
        "limit": 50,
        "forwardBufferInSec": 5
      };
  var lim = config.limit || 10;
  var now = (new Date()).getTime();
  var t = now - (config.forwardBufferInSec * 60 * 1000); // js timestamp is in ms
  var _watch = BeaconEvents.find({ beaconId: beaconId,  type: "didRangeBeacons", createdAt: { $gt: t } });
  var tmpl = this;
  var handle = null;
  handle = _watch.observeChanges({
      added: function(id, fields){
        // We do something when new event get in
        var $container = jQuery(".beacon-map");
        var qn = Template.beacons_map_marker.prefix + beaconId;
        var qs = $container.queue(qn).length;
        if(!Template.beacons_map_marker.owlMode){ console.log(id, "➣", qn, qs) }
        $container.queue(qn, function() {
          if(!Template.beacons_map_marker.owlMode){ console.log("Running", qn) }
          tmpl.processing = true;
          var self = this; //container dom node
          var _beaconId = beaconId;
          var marker = $(".beacon-marker[data-beacon-id='"+_beaconId+"']");
          // avoid blocking.
          setTimeout(function(){
            $(marker).find(".pulse").addClass("on").append('<div class="ring"></div>'); //avoid caching
          }, 100)
        });
        if(!tmpl.processing && qs === 0){
          console.log("interrupt")
          tmpl.processing = true;
          $container.dequeue(qn);

        }
      }
  });
  this.handle = handle;
  var $marker = $(".beacon-marker[data-beacon-id='"+beaconId+"']");
  var qn = Template.beacons_map_marker.prefix + beaconId;

  $marker.on(animationEnd, ".pulse", function(e){
    if(!Template.beacons_map_marker.owlMode){ console.log("Next:", qn) }
      //console.log($(".on .ring", e.target), e.target)
    $(e.target).remove()
    setTimeout(function(){
      tmpl.processing = false;
      $(".beacon-map").dequeue(qn)
    }, 100)
  })
};

Template.beacons_map_marker.destroyed = function(){
  this.processing = false;
  this.domReady = false;
  this.handle.stop();
}