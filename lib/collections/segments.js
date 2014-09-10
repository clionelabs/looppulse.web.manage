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
    var installationIds = [];
    _.each(criteria.locations, function(location) {
      if (location.category) {
        var category = Categories.findOne({companyId: companyId, name: location.category});
        category.installations().map(function(installation) {
          installationIds.push(installation._id);
        });
      } else if (location.product) {
        var product = Products.findOne({companyId: companyId, name: location.product});
        product.installations().map(function(installation) {
          installationIds.push(installation._id);
        });
      } else if (location.floor) {
        // TODO for all locationIds of a company? otherwise where to fetch locationId
        var locationIds = Locations.find({companyId: companyId}).map(function(location) {
          return location._id;
        });
        var floor = Floors.findOne({locationId: {$in: locationIds}, level: location.floor});
        floor.installations().map(function(installation) {
          installationIds.push(installation._id);
        });
      }
    });
    // FIXME handle `criteria.to === "all"` case
    encounterSelector.installationId = {$in: installationIds};
    if (criteria.minutes) {
      encounterSelector.duration = {};
      if (criteria.minutes.atLeast) {
        encounterSelector.duration.$gte = criteria.minutes.atLeast * 60 * 1000;
      }
      if (criteria.minutes.atMost) {
        encounterSelector.duration.$lte = criteria.minutes.atMost * 60 * 1000;
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
