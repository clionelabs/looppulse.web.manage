console.log("Publishers Ready, Deploying")

/**
# Guideline of Publication
## Basic Rules
- User cannot see the code here, but they can see the subscription name on client side
- You can only return cursor, or array of cursor
- If return in array, you can return different collection only

## Principle
- return only what client should see (aka: min. set of fields, even the user is an admin)
- MUST check the user right before building query

*/

//General Publication
Meteor.publish('owned-companies', function() {
  var q = {}
  console.log("Returning Company Data of User", this.userId)

  q = { ownedByUserIds: { $in : [ this.userId ] } }

  return Companies.find(q, { fields: { _id:1, name:1 } }); //Note: Return MongoDB Cursor

});

Meteor.publish('owned-locations', function(id) {
  var q = {}
  console.log("Returning Location Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { companyId: id }
  } else {
    return null;
  }
  return Locations.find(q);
});
Meteor.publish('current-location', function(id){
  var q = {}
  console.log("Returning Location Data (Current)", id)
  if (id && AccountsHelper.fieldMatch("locations", id, this.userId)) {
    q = { _id: id }
  } else {
    return null;
  }
  return Locations.find(q)
})

Meteor.publish('owned-products', function(id){
  var q = {}
  console.log("Returning Products Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { companyId: id }
  } else {
    return null;
  }
  return Products.find(q)
})

Meteor.publish('owned-installations', function(id){
  var q = {}
  console.log("Returning Installations Data", id)
  if (id && AccountsHelper.fieldMatch("locations", id, this.userId)) {
    q = { locationId: id }
  } else {
    return null;
  }
  return Installations.find(q)
})

Meteor.publish('related-encounters', function(ids){
  var q = {}
  console.log("Returning Encounters Data", ids)
  if (ids && AccountsHelper.fieldMatch("installations", ids, this.userId)) {
    if (typeof ids == "string") {
      q = { installationId: id }
    } else if (ids.length) {
      q = { installationId: { $in:  ids } }
    }
  } else {
    return null;
  }
  return Encounters.find(q)
})


Meteor.publish('related-beacon-events', function(ids){
  var q = {}
  console.log("Returning Encounters Data", ids)
  if (ids && AccountsHelper.fieldMatch("beacons", ids, this.userId)) {
    if (typeof ids == "string") {
      q = { beaconId: ids }
    } else if (ids.length) {
      q = { beaconId: { $in:  ids } }
    }
  } else {
    return null;
  }
  return BeaconEvents.find(q)
})

Meteor.publish('related-metrics', function(id){
  var q = {};
  console.log("Returning Metric Data", id);

  if (id && AccountsHelper.fieldMatch("locations", id, this.userId)) {
    var now = new Date();
    q = {
      locationId: id,
      // TODO allow this to be set on client-side?
      $or: [{
        resolution: Metric.daily,
        startTime: { $gte: MetricsHelper.nDaysAgoTruncatedTime(now, 30) }
      }, {
        resolution: Metric.hourly,
        startTime: { $gte: MetricsHelper.nHoursAgoTruncatedTime(now, 24) }
      }, {
        resolution: { $exists: false }
      }]
    };
  } else {
    return null;
  }
  return Metrics.find(q);
});

Meteor.publish('location-engagements', function(locationId) {
  var q = {};
  console.log("Returning location-engagements Data", locationId);

  if (locationId && AccountsHelper.fieldMatch("locations", locationId, this.userId)) {
    q = { locationId: locationId };
  } else {
    return null;
  }

  return Engagements.find(q);
});

Meteor.publish('owned-segments', function(id) {
  var q = {};
  var userId = this.userId;
  console.log("Returning Segment Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { companyId: id }
  } else {
    if (!userId || !Roles.userIsInRole(userId, ['admin']))
        return null;
  }
  return Segments.find(q);
});

Meteor.publish('owned-campaigns', function(id) {
  var q = {};
  var userId = this.userId;

  console.log("Returning Campaign Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { companyId: id }
  } else {
    if (!userId || !Roles.userIsInRole(userId, ['admin']))
        return null;
  }
  return Engagements.find(q);
});

Meteor.publish('owned-categories', function(id) {
  var q = {};
  var userId = this.userId;

  console.log("Returning Categories Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { companyId: id }
  } else {
    if (!userId || !Roles.userIsInRole(userId, ['admin']))
        return null;
  }
  return Categories.find(q);
});

Meteor.publish('location-floors', function(locationId) {
  var q = {};
  console.log("Returning location-floors Data", locationId);

  if (locationId && AccountsHelper.fieldMatch("locations", locationId, this.userId)) {
    q = { locationId: locationId };
  } else {
    return null;
  }

  return Floors.find(q);
});

Meteor.publish('owned-floors', function(id) {
  var q = {};
  var userId = this.userId;

  console.log("Returning Categories Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { companyId: id }
  } else {
    if (!userId || !Roles.userIsInRole(userId, ['admin']))
        return null;
  }

  var locations = Locations.find(q).fetch();
  var locationIds = _.pluck(locations, "_id");
  return Floors.find({locationId:{$in:locationIds}});
});

//@@DEV
//@@Admin Use
Meteor.publish('all-companies', function(){
  var q = {}
  var userId = this.userId

  if (!userId || !Roles.userIsInRole(userId, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

  return Companies.find(q);
})

Meteor.publish("admin-assignee", function(){
  var userId = this.userId

  if (!userId || !Roles.userIsInRole(userId, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

  return Meteor.users.find({}, { fields:{"emails.address": 1 , "profile":1} })
})

Meteor.publish('watch-base', function(){
  var userId = this.userId

  if (!userId || !Roles.userIsInRole(userId, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

  //return only the min. set
  return [
    Locations.find({}, { fields:{ _id:1, name:1, companyId:1 } }),
    Companies.find({}, { fields:{ _id:1, name:1 } })
  ]
})

Meteor.publish('segmentsMetrics', function (segmentIds) {
  var self = this;
  console.log("Returning Segments Metrics Data", self.userId);

  // FIXME find relationship between User and Segment
  if (!_.isArray(segmentIds) || !Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return SegmentMetrics.find({
    segmentId: { $in: segmentIds },
    type: Metric.forever
  });
});

Meteor.publish('segmentMetrics', function (segmentId, numOfDaysAgo) {
  var self = this;
  console.log("Returning Segment Metrics Data", self.userId);

  // FIXME find relationship between User and Segment
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return SegmentMetrics.find({
    segmentId: segmentId,
    $or: [
      {
        resolution: Metric.forever
      },
      {
        resolution: Metric.daily,
        startTime: { $gte: +moment().startOf('day').subtract(numOfDaysAgo, 'days') }
      }
    ]
  });
});

Meteor.publish('companies', function () {
  var self = this;
  console.log("Returning Company Data", self.userId);

  // FIXME find relationship between User and Category
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Companies.find();
});

Meteor.publish('companyCategories', function (companyId) {
  var self = this;
  console.log("Returning Company Category Data", companyId);

  // FIXME find relationship between User and Category
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Categories.find({ companyId: companyId });
});

Meteor.publish('companyLocations', function (companyId) {
  var self = this;
  console.log("Returning Company Location Data", companyId);

  // FIXME find relationship between User and Company
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Locations.find({ companyId: companyId });
});

Meteor.publish('companyProducts', function (companyId) {
  var self = this;
  console.log("Returning Company Product Data", companyId);

  // FIXME find relationship between User and Product
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Products.find({ companyId: companyId });
});

Meteor.publish('companySegments', function (companyId) {
  var self = this;
  console.log("Returning Company Segments Data", self.userId);

  // FIXME add relationship between User and Company
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Segments.find({ companyId: companyId });
});

Meteor.publish('locationsFloors', function (locationIds) {
  var self = this;
  console.log("Returning Locations Floor Data", locationIds);

  // FIXME find relationship between User and Locations
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Floors.find({ locationId: { $in: locationIds } });
});
