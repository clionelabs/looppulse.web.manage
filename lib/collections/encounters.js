// An encounter summaries the entrance and exit time of
// a visitor visiting a beacon

Encounters = new Meteor.Collection('encounters', {
  transform: function (doc) {
    // TODO refactor constructor to load from doc
    var obj = new Encounter(doc.visitorId, doc.installationId, doc.enteredAt);
    _.extend(obj, doc);
    return obj;
  }
});

Encounter = function(visitorId, installationId, enteredAt) {
  this.visitorId = visitorId;
  this.installationId = installationId;
  this.enteredAt = enteredAt;
}

Encounter.prototype.close = function (exitedAt) {
  this.exitedAt = exitedAt;
  this.duration = this.exitedAt - this.enteredAt;
}

Encounter.prototype.isClosed = function () {
  return !!this.exitedAt;
};

Encounter.prototype.findPrevious = function (filters) {
  filters = filters || {};

  var selector = {
    visitorId: this.visitorId,
    enteredAt: {
      $lt: this.enteredAt
    }
  };
  if (filters.after) {
    selector.enteredAt.$gt = filters.after;
  }
  if (filters.installationIds) {
    selector.installationId = {
      $in: filters.installationIds
    }
  }
  return Encounters.findOne(selector);
};

Encounter.prototype.save = function() {
  var selector = {
    visitorId: this.visitorId,
    installationId: this.installationId,
    enteredAt: this.enteredAt
  };
  var modifier = {
    $set: {
      exitedAt: this.exitedAt,
      duration: this.duration
    }
  };
  var result = Encounters.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Encounters.findOne(selector)._id;
  }
  return this._id;
}

Encounter.findClosed = function () {
  return Encounters.find({exitedAt: {$type: 9}});
}

Encounter.findLastOpen = function (beaconEvent, installation) {
  // There could be more than one open Encounter, sorting with enteredAt to find the closest one.
  return Encounters.findOne({
    visitorId: beaconEvent.visitorId,
    installationId: installation._id,
    enteredAt: {$lt: beaconEvent.createdAt},
    exitedAt: {$not: {$type: 9}}
  }, {sort: {enteredAt: -1}});
}

Encounter.createOrUpdate = function (beaconEvent) {
  var installation = Installations.findOne({beaconId: beaconEvent.beaconId});
  if (!installation) {
    console.warn("[Encounter] Beacon missing installation:", beaconEvent.beaconId);
    return;
  }
  var encounter;
  if (beaconEvent.isEnter()) {
    encounter = new Encounter(beaconEvent.visitorId, installation._id, beaconEvent.createdAt);
  } else if (beaconEvent.isExit()) {
    encounter = Encounter.findLastOpen(beaconEvent, installation);
    if (encounter) {
      encounter.close(beaconEvent.createdAt);

      // FIXME avoid visitor query and move to better place
      var visitor = Visitors.findOne({_id: beaconEvent.visitorId});
      var location = Location.load(installation.locationId);
      Metric.update(location, encounter, visitor);
    } else {
      console.warn("[Encounter] Enter event missed / not processed:", beaconEvent.beaconId);
      return;
    }
  } else {
    return;
  }
  return encounter.save();
}

Encounter.ensureIndex = function() {
  Encounters._ensureIndex({visitorId:1, installationId:1, enteredAt:1, exitedAt:1});
}

Encounter.startup = function() {
  BeaconEvents.find().observe({
    _suppress_initial: true,
    "added": function(beaconEvent) { Encounter.createOrUpdate(beaconEvent); }
  });
  console.info("[Encounter] startup complete");
}
