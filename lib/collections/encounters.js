Encounters = new Meteor.Collection('encounters', {
  transform: function (doc) {
    var obj = new Encounter(doc.visitorId, doc.installationId, doc.enteredAt);
    if (!(doc.exitedAt === undefined || doc.exitedAt === null)) {
      obj.close(doc.exitedAt);
    }
    return obj;
  }
});

Encounters.findOneByCompany = function(companyId, selector) {
  var installationIds = Installations.findByCompany(companyId).map(function(installation) {
    return installation._id;
  });
  return Encounters.findOne(_.extend({
    installationId: { $in: installationIds }
  }, selector));
};

Encounters.findOpen = function () {
  return Encounters.find({exitedAt: {$not: {$type: 1}}});
};

Encounters.findClosed = function (selector) {
  if (!selector) {
    selector = {};
  }
  _.extend(selector, {exitedAt: {$type: 1}});
  return Encounters.find(selector);
};

Encounters.findClosedByVisitorsInTimePeriod = function(visitors, from, to) {
  var selector = { visitorId : { $in : visitors }, enteredAt: { $gte : from , $lte : to}};
  return Encounters.findClosed(selector);
}


Encounters.findLastOpen = function (beaconEvent, installation) {
  // There could be more than one open Encounter, sorting with enteredAt to find the closest one.
  return Encounters.findOne({
    visitorId: beaconEvent.visitorId,
    installationId: installation._id,
    enteredAt: {$lt: beaconEvent.createdAt},
    exitedAt: {$not: {$type: 9}}
  }, {sort: {enteredAt: -1}});
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
  this.enteredAt = moment(enteredAt);
}

Encounter.prototype.didHappenInCompany = function(companyId) {
  // TODO denormalize companyId to Encounter?
  var installation = Installations.findOne(this.installationId);
  var location = Locations.findOne(installation.locationId);
  return location.companyId === companyId;
};

Encounter.prototype.close = function (exitedAt) {
  this.exitedAt = moment(exitedAt);
  this.duration = this.exitedAt.diff(this.enteredAt, 'millisecond');
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

/**
 *
 * @param [extraSelector]
 * @returns {Meteor.Collection.Cursor}
 */
Encounter.prototype.findRangeBeaconEvents = function(extraSelector) {
  var installation = Installations.findOne(this.installationId);
  var selector = {
    beaconId: installation.beaconId,
    type: BeaconEvent.rangingType,
    visitorId: this.visitorId,
    createdAt: {
      $gte: this.enteredAt,
      $lte: this.exitedAt
    }
  };
  if (extraSelector) {
    _.extend(selector, extraSelector);
  }
  return BeaconEvents.find(selector);
};

Encounter.prototype.isEnter = function() {
  if (!this.isClosed() &&
      this.findRangeBeaconEvents().count()===0) {
    return true;
  }
  return false;
}

// Entering encounters are not qualified because it does not contain
// any ranging event which we can't use for qualifying.
Encounter.prototype.isQualified = function() {
  return this.findRangeBeaconEvents({
    proximity: { $in: BeaconEvent.nearProximities }
  }).count() >= 1;
};

Encounter.prototype.timestampToParts = function(milliseconds) {
  //TODO remove as there is moment.js???
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
    enteredAt: this.enteredAt.valueOf()
  };
  var modifier = {
    $set: {
      exitedAt: this.exitedAt.valueOf(),
      duration: this.duration,
      enteredAtParts: this.timestampToParts(this.enteredAt.valueOf())
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
};
