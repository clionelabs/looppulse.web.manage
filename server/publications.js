console.log("Publishers Ready, Deploying")

//General Publication
Meteor.publish('owned-company', function(id) {
  var q = {}
  console.log("Returning Company Data", id)
  if (id && AccountsHelper.companyMatch(id, this.userId)) {
    q = { _id: id }
  } else {
    return null;
  }

  return Companies.find(q); //Note: Return MongoDB Cursor

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

Meteor.publish('related-funnels', function(ids){
  var q = {}
  console.log("Returning Funnel Data", ids)

  if (ids && AccountsHelper.fieldMatch("installations", ids, this.userId)) {
    if (typeof ids == "string") {
      q = { installationId: ids }
    } else if (ids.length) {
      q = { installationId: { $in:  ids } }
    }
  } else {
    //@@DEV
    q = {}
  }

  return Funnels.find(q)
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
        resolution: "daily",
        startTime: { $gte: MetricsHelper.nDaysAgoTruncatedTime(now, 30) }
      }, {
        resolution: "hourly",
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
