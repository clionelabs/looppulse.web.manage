Template.beacons_map.helpers({
  events: function(beaconsCursor){
    if (!beaconsCursor) { return null }
    var beaconIds = beaconsCursor.map(function(o) { return o.beaconId; })
    var events = BeaconEvents.find({ beaconId: { $in: beaconIds },  type: "didRangeBeacons" })
    return events;
  },
  getCoord: function() {
    //console.log(this)
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
  // console.log(this)
  var self = this;
  self.marker = 0;

  var pulsing = function($elem) {
    $elem.find(".pulse").first().addClass("on")
  }

  $('.beacon-map').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', '.beacon-marker', function(e){
    //target: ring
    //current target: marker
    //delegate: map
    var marker = e.currentTarget;
    $(".on", marker).removeClass("on");
    pulsing($(marker))
  }).on("beacon-set beacon-rendered", function(e, beaconId){
    pulsing($("[data-beacon-id='"+beaconId+"']", e.target))
  });
}
Template.beacons_map_marker.prefix = "beacon-";
Template.beacons_map_marker.created = function(){
  var beaconId = this.data.beacon.beaconId
  //console.log("Setting Up Query Listener", this, beaconId)
  var config = Meteor.settings.public.view.beaconsMap || {};
  var lim = config.limit || 10;
  var now = (new Date()).getTime();
  var t = now - (config.forwardBufferInSec * 60 * 1000); // js timestamp is in ms
  var _watch = BeaconEvents.find({ beaconId: beaconId,  type: "didRangeBeacons", createdAt: { $gt: t } })；
  var tmpl = this;
  var handle = null;
  console.log(t, this);
  this.processing = false;
  handle = _watch.observeChanges({
      added: function(id, fields){
        // We do something when new event get in
        var $container = jQuery(".beacon-map");
        var qn = Template.beacons_map_marker.prefix + beaconId;
        var qs = $container.queue(qn).length;
        console.log(id, "➣", qn, qs)
        $container.queue(qn, function() {
          var self = this; //container dom node
          var _qn = qn;
          var _beaconId = beaconId;
          //console.log(next);
          tmpl.processing = true;
          setTimeout(function() {
            tmpl.processing = false;
            console.log("End", _beaconId);
            $(self).dequeue(_qn);
          }, 1200)
        });
        if(!tmpl.processing & tmpl.domReady){
          tmpl.processing = true;
          $container.dequeue(qn);

        }
      }
  });
  this.handle = handle;

  //jQuery('.beacon-map').trigger("beacon-set", beaconId)
};
Template.beacons_map_marker.rendered = function(){
  //console.log("marker rendered", this.data.beacon.beaconId)
  var beaconId = this.data.beacon.beaconId;
  this.domReady = true;
  //jQuery('.beacon-map').trigger("beacon-rendered", beaconId)
};

Template.beacons_map_marker.destroyed = function(){
  this.processing = false;
  this.domReady = false;
  this.handle.stop();
}