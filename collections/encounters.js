// An encounter summaries the entrance and exit time of
// a visitor visiting a beacon

Encounters = new Meteor.Collection('encounters');

Encounter = function(visitor_id, beacon_id, eventType, eventCreatedAt) {
  this.visitor_id = visitor_id;
  this.beacon_id = beacon_id;
  this.eventType = eventType;
  this.eventCreatedAt = eventCreatedAt;
}

Encounter.prototype.saveIfExit = function() {
  if (this.didExit()) {
    this.close();
    this.save();
  }
}

Encounter.prototype.didExit = function() {
  return (this.eventType == BeaconEvent.exitType());
}

Encounter.prototype.close = function () {
  this.enteredAt = this.entryEvent().createdAt;
  this.exitedAt = this.eventCreatedAt;
  this.duration = this.exitedAt - this.enteredAt;
}

Encounter.prototype.toHash = function() {
  return {visitor_id: this.visitor_id,
          beacon_id: this.beacon_id,
          enteredAt: this.enteredAt,
          exitedAt: this.exitedAt,
          duration: this.duartion};
}

Encounter.prototype.save = function() {
  var hash = this.toHash();
  Encounters.upsert(hash, hash);
  this._id = Encounters.findOne(hash)._id;
  return this._id;
}

// Possible entry event is the first event since last exit event
Encounter.prototype.entryEvent = function() {
  var lastExitEvent = BeaconEvents.findOne({visitor_id: this.visitor_id,
                                            beacon_id: this.beacon_id,
                                            type: BeaconEvent.exitType(),
                                            createdAt: {$lt: this.eventCreatedAt}},
                                           {sort: {createdAt: -1}});
  var firstNonExitEvent = BeaconEvents.findOne({visitor_id: this.visitor_id,
                                                beacon_id: this.beacon_id,
                                                type: {$ne: BeaconEvent.exitType()},
                                                createdAt: {$gt: lastExitEvent.createdAt}},
                                               {sort: {createdAt: 1}});
   return firstNonExitEvent;
}
