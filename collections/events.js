Events = new Meteor.Collection('events');

Event = function(json) {
  this.type = json.event;
  var beacon = new Beacon(json.uuid, json.major, json.minor);
  this.beacon_id = beacon.save();
}

Event.prototype.save = function() {
  Events.upsert(this, this);
  this._id = Events.findOne(this)._id;
  return this._id;
}
