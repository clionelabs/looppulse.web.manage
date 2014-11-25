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

Meteor.publish('locations', function(id) {
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
});

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
});

Meteor.publish('listSegmentGraphs', function(from, to, id) {
  if (this.userId) {
    return SegmentGraphs.findList(from, to, id);
  } else {
    return null;
  }
});

Meteor.publish('segmentGraphs', function(from, to, id) {
  if (this.userId) {
    return SegmentGraphs.findByGraphType(from, to, id);
  } else {
    return null;
  }
});

Meteor.publish('location-engagements', function(locationId) {
  var q = {};
  console.log("Returning location-engagements Data", locationId);
  //TODO AccountsHelper.findMatch do nothing
  if (locationId && AccountsHelper.fieldMatch("locations", locationId, this.userId)) {
    q = { locationId: locationId };
  } else {
    return null;
  }

  return Engagements.find(q);
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


Meteor.publish('companies', function () {
  var q = {};
  console.log("Returning Company Data of User", this.userId)

  q = { ownedByUserIds: { $in : [ this.userId ] } }
  return Companies.find(q, { fields: { _id:1, name:1 } }); //Note: Return MongoDB Cursor
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

Meteor.publish('companyLocationsFloors', function (companyId) {
  var self = this;
  console.log("Returning Locations Floor Data from company ", companyId);

  var locationIds = _.pluck(Locations.find({ companyId: companyId }).fetch(), "_id");

  // FIXME find relationship between User and Locations
  if (!Roles.userIsInRole(self.userId, ['admin'])) {
    return null;
  }

  return Floors.find({ locationId: { $in: locationIds } }, { sort : {level : 1}});
});
