BeaconEvents = new Meteor.Collection('beacon_events');

BeaconEvent = function(visitor, beacon, json) {
  this.visitor_id = visitor._id;
  this.beacon_id = beacon._id;
  this.type = json.type;
  this.createdAt = Date.parse(json.created_at);
  if (this.type == 'didRangeBeacons') {
    this.accuracy = json.accuracy;
    this.proximity = json.proximity;
    this.rssi = json.rssi;
  }
}

BeaconEvent.prototype.save = function() {
  BeaconEvents.upsert(this, this);
  this._id = BeaconEvents.findOne(this)._id;
  return this._id;
}
