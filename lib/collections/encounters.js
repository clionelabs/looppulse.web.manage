Encounters = new Meteor.Collection('encounters', {
  transform: function (doc) {
    // TODO refactor constructor to load from doc
    var obj = new Encounter(doc.visitorId, doc.installationId, doc.enteredAt);
    _.extend(obj, doc);
    return obj;
  }
});

Encounters.findOpen = function () {
  return Encounters.find({exitedAt: {$not: {$type: 1}}});
};

Encounters.findClosed = function () {
  return Encounters.find({exitedAt: {$type: 1}});
};

Encounters.findLastOpen = function (beaconEvent, installation) {
  // There could be more than one open Encounter, sorting with enteredAt to find the closest one.
  return Encounters.findOne({
    visitorId: beaconEvent.visitorId,
    installationId: installation._id,
    enteredAt: {$lt: beaconEvent.createdAt},
    exitedAt: {$not: {$type: 9}}
  }, {sort: {enteredAt: -1}});
};

Encounters.createOrUpdate = function (beaconEvent) {
  var installation = Installations.findOne({beaconId: beaconEvent.beaconId});
  if (!installation) {
    console.warn("[Encounter] Beacon missing installation:", beaconEvent.beaconId);
    return;
  }
  var encounter;
  if (beaconEvent.isEnter()) {
    encounter = new Encounter(beaconEvent.visitorId, installation._id, beaconEvent.createdAt);
  } else if (beaconEvent.isExit()) {
    encounter = Encounters.findLastOpen(beaconEvent, installation);
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
};

/**
 * An encounter summaries the entrance and exit time of a visitor visiting a beacon.
 * - belongs to an {@link Visitor}
 * - belongs to a {@link Installation}
 *
 * @param visitorId
 * @param installationId
 * @param enteredAt
 * @constructor
 *
 * @property visitorId
 * @property installationId
 * @property enteredAt
 * @property exitedAt
 * @property duration
 */
Encounter = function(visitorId, installationId, enteredAt) {
  this.visitorId = visitorId;
  this.installationId = installationId;
  this.enteredAt = enteredAt;
}

Encounter.prototype.didHappenInCompany = function(companyId) {
  // TODO denormalize companyId to Encounter?
  var installation = Installations.findOne(this.installationId);
  var location = Locations.findOne(installation.locationId);
  return location.companyId === companyId;
};

Encounter.prototype.close = function (exitedAt) {
  this.exitedAt = exitedAt;
  this.duration = this.exitedAt - this.enteredAt;
}

Encounter.prototype.isClosed = function () {
  return !!this.exitedAt;
};

/**
 *
 * @param [beforeTime]
 * @returns {boolean}
 */
Encounter.prototype.hasVisitedBefore = function(beforeTime) {
  var selector = {
    installationId: this.installationId,
    visitorId: this.visitorId
  };
  if (beforeTime) {
    selector.enteredAt = { $lt: beforeTime };
  }
  return !!Encounters.findOne(selector);
};

Encounter.prototype.findPrevious = function (filters) {
  filters = filters || {};

  var selector = {
    visitorId: this.visitorId,
    enteredAt: {
      $lt: this.enteredAt
    }
  };
  if (filters.minDuration) {
    selector.duration = {
      $gte: filters.minDuration
    };
  }
  if (filters.millisecondsSinceEnteredAt) {
    selector.enteredAt.$gt = this.enteredAt - filters.millisecondsSinceEnteredAt;
  }
  if (filters.installationIds) {
    selector.installationId = {
      $in: filters.installationIds
    }
  }
  return Encounters.findOne(selector);
};

Encounter.prototype.findRangeBeaconEvents = function() {
  var installation = Installations.findOne(this.installationId);
  return BeaconEvents.find({
    beaconId: installation.beaconId,
    type: BeaconEvent.rangingType,
    visitorId: this.visitorId,
    createdAt: {
      $gte: this.enteredAt,
      $lte: this.exitedAt
    }
  });
};

Encounter.prototype.isEnter = function() {
  if (!this.isClosed() &&
      this.findRangeBeaconEvents().count()===0) {
    return true;
  }
  return false;
}

// Entering encounters are not qualified becase it does not contain
// any ranging event which we can't use for qualifying.
Encounter.prototype.isQualified = function() {
  return true;

  var leastNearCount = 1;
  this.findRangeBeaconEvents().forEach(function(beaconEvent) {
    if (beaconEvent.isNear()) {
      leastNearCount -= 1;
    }
    if (leastNearCount === 0) {
      return false;
    }
  });
  return leastNearCount === 0;
};

Encounter.prototype.timestampToParts = function(milliseconds) {
  var date = new Date(milliseconds);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    dayOfWeek: date.getDay(),
    hourOfDay: date.getHours(),
    minuteOfHour: date.getMinutes()
  };
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
      duration: this.duration,
      enteredAtParts: this.timestampToParts(this.enteredAt)
    }
  };
  if (this.exitedAt) {
    modifier.$set.exitedAtParts = this.timestampToParts(this.exitedAt);
  }
  var result = Encounters.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Encounters.findOne(selector)._id;
  }
  return this._id;
}

Encounter.ensureIndex = function() {
  Encounters._ensureIndex({visitorId:1, installationId:1, enteredAt:1, exitedAt:1});
}

Encounter.startup = function() {
  BeaconEvents.find().observe({
    _suppress_initial: true,
    "added": function(beaconEvent) { Encounters.createOrUpdate(beaconEvent); }
  });
  console.info("[Encounter] startup complete");
}
