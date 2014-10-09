BeaconEvents = new Meteor.Collection('beacon_events', {
  transform: function (doc) {
    // TODO refactor constructor to load from doc
    var obj = new BeaconEvent(doc.visitorId, doc.beaconId, doc.sessionId, doc);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 * A beacon event is the raw event fired from our SDK from our clients.
 * - belongs to an {@link Visitor}
 * - belongs to a {@link Beacon}
 * - belongs to a {@link Session}
 *
 * @param visitorId
 * @param beaconId
 * @param sessionId
 * @param json
 * @constructor
 *
 * @property {string} visitorId
 * @property {string} beaconId
 * @property {string} sessionId
 * @property {string} type
 * @property {date} createdAt
 * @property accuracy
 * @property proximity
 * @property rssi
 * */
BeaconEvent = function(visitorId, beaconId, sessionId, json) {
  this.visitorId = visitorId;
  this.beaconId = beaconId;
  this.sessionId = sessionId;
  this.type = json.type;
  this.createdAt = Date.parse(json.created_at);
  if (this.type == BeaconEvent.rangingType) {
    this.accuracy = json.accuracy;
    this.proximity = json.proximity;
    this.rssi = json.rssi;
  }
}
BeaconEvent.entryType = "didEnterRegion";
BeaconEvent.rangingType = "didRangeBeacons";
BeaconEvent.exitType = "didExitRegion";

BeaconEvent.nearProximities = ["near", "intermediate"];

BeaconEvent.prototype.save = function() {
  this.warnAboutUnknownProximity();
  var selector = {
    visitorId: this.visitorId,
    beaconId: this.beaconId,
    sessionId: this.sessionId,
    type: this.type,
    createdAt: this.createdAt
  };
  var modifier = {
    $set: {
      accuracy: this.accuracy,
      proximity: this.proximity,
      rssi: this.rssi
    }
  };
  var result = BeaconEvents.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = BeaconEvents.findOne(selector)._id;
  }
  return this._id;
}

BeaconEvent.prototype.isEnter = function() {
  return (this.type === BeaconEvent.entryType);
}

BeaconEvent.prototype.isExit = function() {
  return (this.type === BeaconEvent.exitType);
}

BeaconEvent.prototype.warnAboutUnknownProximity = function() {
  if (this.proximity && this.proximity == "unknown") {
    console.log("[BeaconEvent] Unknown proximity saved! " + JSON.stringify(this));
    return true;
  }
  return false;
}
