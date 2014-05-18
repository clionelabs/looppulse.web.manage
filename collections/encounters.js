// An encounter summaries the entrance and exit time of
// a visitor visiting a beacon

Encounters = new Meteor.Collection('encounters');

Encounter = function(visitor_id, beacon_id, exitedAt) {
  this.visitor_id = visitor_id;
  this.beacon_id = beacon_id;
  this.exitedAt = exitedAt;
  this.close();
}

Encounter.prototype.close = function () {
  this.enteredAt = this.entryEvent().createdAt;
  this.duration = this.exitedAt - this.enteredAt;
}

Encounter.prototype.save = function() {
  Encounters.upsert(this, this);
  this._id = Encounters.findOne(this)._id;
  return this._id;
}

// Possible entry event is the first event since last exit event
Encounter.prototype.entryEvent = function() {
  var lastExitEvent = BeaconEvents.findOne({visitor_id: this.visitor_id,
                                            beacon_id: this.beacon_id,
                                            type: BeaconEvent.exitType(),
                                            createdAt: {$lt: this.exitedAt}},
                                           {sort: {createdAt: -1}});
  var firstNonExitEvent = BeaconEvents.findOne({visitor_id: this.visitor_id,
                                                beacon_id: this.beacon_id,
                                                type: {$ne: BeaconEvent.exitType()},
                                                createdAt: {$gt: lastExitEvent.createdAt}},
                                               {sort: {createdAt: 1}});
   return firstNonExitEvent;
}
