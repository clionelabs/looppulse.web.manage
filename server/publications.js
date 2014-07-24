console.log("Publishers Ready, Deploying")

Meteor.publish('owned-company', function(id) {
  var q = {}
  console.log("Returning Company Data", id)
  if (id) {
    q = { _id: id }
  } else {
    return null;
  }
  return Companies.find(q); //Note: Return MongoDB Cursor

});

Meteor.publish('owned-locations', function(id) {
  var q = {}
  console.log("Returning Location Data", id)
  if (id) {
    q = { companyId: id }
  } else {
    return null;
  }
  return Locations.find(q);
});


Meteor.publish('owned-products', function(id){
  var q = {}
  console.log("Returning Products Data", id)
  if (id) {
    q = { companyId: id }
  } else {
    return null;
  }
  return Products.find(q)
})

Meteor.publish('owned-installations', function(id){
  var q = {}
  console.log("Returning Installations Data", id)
  if (id) {
    q = { locationId: id }
  } else {
    return null;
  }
  return Installations.find(q)
})

Meteor.publish('related-encounters', function(ids){
  var q = {}
  console.log("Returning Encounters Data", ids)
  if (ids) {
    if (typeof ids == "string") {
      q = { installationId: id }
    } else if (ids.length) {
      q = { installationId: { $in:  ids } }
    }
  } else {
    // WARNING: BETA Code. MUST Uncomment.
    //return null;
  }
  return Encounters.find(q)
})


Meteor.publish('related-beacon-events', function(ids){
  var q = {}
  console.log("Returning Encounters Data", ids)
  if (ids) {
    if (typeof ids == "string") {
      q = { beaconId: id }
    } else if (ids.length) {
      q = { beaconId: { $in:  ids } }
    }
  } else {
    // WARNING: BETA Code. MUST Uncomment.
    //return null;
  }
  return BeaconEvents.find(q)
})

Meteor.publish('related-funnels', function(){
  var q = {}
  console.log("Returning Funnel Data")

  return Funnels.find()
})

Meteor.publish('related-metrics', function(){
  var q = {}
  console.log("Returning Metric Data")
  return Metrics.find()
})

//@@DEV
Meteor.publish('all-companies', function(){
  var q = {}
  return Companies.find(q);
})