// An encounter summaries the entrance and exit time of
// a visitor visiting a beacon

Encounters = new Meteor.Collection('encounters');

Encounter = function(visitorId, installationId, exitedAt) {
  this.visitorId = visitorId;
  this.installationId = installationId;
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
  var installation = Installations.findOne({_id: this.installationId});
  var beaconId = installation.beaconId;
  var lastExitEvent = BeaconEvents.findOne({visitorId: this.visitorId,
                                            beaconId: beaconId,
                                            type: BeaconEvent.exitType(),
                                            createdAt: {$lt: this.exitedAt}},
                                           {sort: {createdAt: -1}});
  var firstNonExitEvent;
  if (lastExitEvent) {
    firstNonExitEvent = BeaconEvents.findOne({visitorId: this.visitorId,
                                              beaconId: beaconId,
                                              type: {$ne: BeaconEvent.exitType()},
                                              createdAt: {$gt: lastExitEvent.createdAt}},
                                             {sort: {createdAt: 1}});
  } else {
    // If there was no prior exit event, then we use the first non exit event.
    firstNonExitEvent = BeaconEvents.findOne({visitorId: this.visitorId,
                                              beaconId: beaconId,
                                              type: {$ne: BeaconEvent.exitType()}},
                                             {sort: {createdAt: 1}});
  }
   return firstNonExitEvent;
}
