// A beacon event is the raw event fired from our SDK from our clients

BeaconEvents = new Meteor.Collection('beacon_events');

BeaconEvent = function(visitorId, beaconId, json) {
  this.visitorId = visitorId
  this.beaconId = beaconId
  this.type = json.type;
  this.createdAt = Date.parse(json.created_at);
  if (this.type == BeaconEvent.rangingType()) {
    this.accuracy = json.accuracy;
    this.proximity = json.proximity;
    this.rssi = json.rssi;
  }
}

BeaconEvent.prototype.save = function() {
  if (this.warnAboutUnknownProximity()) {
    return undefined;
  }
  BeaconEvents.upsert(this, this);
  this._id = BeaconEvents.findOne(this)._id;
  return this._id;
}

BeaconEvent.entryType = function() {
  return "didEnterRegion";
}

BeaconEvent.rangingType = function() {
  return "didRangeBeacons";
}

BeaconEvent.exitType = function() {
  return "didExitRegion";
}

BeaconEvent.prototype.isExit = function() {
  return (this.type == BeaconEvent.exitType());
}

BeaconEvent.ensureIndex = function() {
  console.log("BeaconEvent.ensureIndex");
  BeaconEvents._ensureIndex({visitorId:1, beaconId:1, type:1, createdAt:1});
}

BeaconEvent.prototype.warnAboutUnknownProximity = function() {
  if (this.proximity && this.proximity == "unknown") {
    console.log("BeaconEvent with unknown proximity saved! " + JSON.stringify(this));
    return true;
  }
  return false;
}
