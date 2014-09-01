BeaconEvents = new Meteor.Collection('beacon_events', {
  transform: function (doc) {
    // TODO refactor constructor to load from doc
    var obj = new BeaconEvent(doc.visitorId, doc.beaconId, doc);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 * A beacon event is the raw event fired from our SDK from our clients.
 * - belongs to an {@link Visitor}
 * - belongs to a {@link Beacon}
 *
 * @param visitorId
 * @param beaconId
 * @param json
 * @constructor
 *
 * @property {string} visitorId
 * @property {string} beaconId
 * @property {string} type
 * @property {date} createdAt
 * @property accuracy
 * @property proximity
 * @property rssi
 * */
BeaconEvent = function(visitorId, beaconId, json) {
  this.visitorId = visitorId;
  this.beaconId = beaconId;
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

BeaconEvent.prototype.isNear = function() {
  return _.contains(["near", "intermediate"], this.proximity);
};

BeaconEvent.prototype.save = function() {
  this.warnAboutUnknownProximity();
  var selector = {
    visitorId: this.visitorId,
    beaconId: this.beaconId,
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

BeaconEvent.ensureIndex = function() {
  BeaconEvents._ensureIndex({visitorId:1, beaconId:1, type:1, createdAt:1});
}

BeaconEvent.prototype.warnAboutUnknownProximity = function() {
  if (this.proximity && this.proximity == "unknown") {
    console.log("BeaconEvent with unknown proximity saved! " + JSON.stringify(this));
    return true;
  }
  return false;
}
