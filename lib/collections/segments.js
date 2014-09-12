Segments = new Meteor.Collection("segments", {
  transform: function(doc) {
    return new Segment(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property companyId
 * @property name
 * @property criteria
 */
Segment = function(doc) {
  _.extend(this, doc);
};

Segment.prototype.description = function() {
  return this.name;
};

Segment.prototype.match = function(visitor) {
  var criteria = this.criteria;
  if (criteria) {
    // TODO abstract logic in classes?
    var now = new Date();
    var companyId = this.companyId;
    var encounterSelector = {
      visitorId: visitor._id
    };
    var triggerLocation = new TriggerLocation(companyId, criteria.triggerLocations);
    var installationIds = triggerLocation.installationIds();
    // FIXME handle `criteria.to === "all"` case
    encounterSelector.installationId = {$in: installationIds};
    var durationInMinutes = criteria.durationInMinutes;
    if (durationInMinutes) {
      encounterSelector.duration = {};
      if (durationInMinutes.atLeast) {
        encounterSelector.duration.$gte = durationInMinutes.atLeast * 60 * 1000;
      }
      if (durationInMinutes.atMost) {
        encounterSelector.duration.$lte = durationInMinutes.atMost * 60 * 1000;
      }
    }
    if (criteria.days) {
      encounterSelector.enteredAt = {
        $gte: MetricsHelper.nDaysAgo(now, criteria.days.inLast)
      };
    }
    switch (criteria.every) {
      case "weekdays":
        encounterSelector["enteredAtParts.dayOfWeek"] = { $gte: 1, $lte: 5 };
        break;
      case "weekends":
        encounterSelector["enteredAtParts.dayOfWeek"] = { $in: [0, 6] };
        break;
      case "day":
        break;
    }
    var encounterCount = Encounters.find(encounterSelector).count();
    // FIXME will `criteria.hasBeen` affect this selector?
    if (criteria.times.atLeast && encounterCount < criteria.times.atLeast) {
      return false;
    }
    if (criteria.times.atMost && encounterCount > criteria.times.atMost) {
      return false;
    }
    return criteria.hasBeen ? encounterCount > 0 : encounterCount === 0;
  } else {
    return !!Encounters.findOne({visitorId: visitor._id});
  }
};

Segment.prototype.save = function() {
  var selector = {
    companyId: this.companyId,
    name: this.name
  };
  var modifier = {
    $set: {
    }
  };
  var result = Segments.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Segments.findOne(selector)._id;
  }
  return this._id;
};
