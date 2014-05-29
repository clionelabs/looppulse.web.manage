DEBUG = true
console.log("Publishers Ready, Deploying")

Meteor.publish('owned-company', function(_id) {
  q = {}
  if (_id) {
    q = {_id:_id}
  } else if (DEBUG) {
    q = {}
  } else {
    return null;
  }
  return Companies.find(q); //Note: Return MongoDB Cursor

});

Meteor.publish('owned-locations', function(companyId) {
  q = {}
  if (companyId) {
    q = {companyId:companyId}
  } else if (DEBUG) {
    q = {}
  } else {
    return null;
  }
  return Locations.find(q);
});


Meteor.publish('owned-products', function(companyId){
  return Products.find()
})

Meteor.publish('owned-installations', function(companyId){
  return Installations.find()
})

Meteor.publish('related-encounters', function(companyId){
  return Encounters.find()
})


// Meteor.publish('location', function(_id) {
//   return Locations.findOne(_id);
// });

Meteor.publish('beacons', function(_id) {
  // var products = Products.find({location_id: location_id});
  // return products.map(function(product, index, ref) {
  //   Beacons.findOne({product_id: product._id},
  //                   {fields: {uuid: 0, major: 0, minor: 0}});
  // });
});

// Meteor.publish('encounters', function(beacon_id) {
//   return Encounters.find({beacon_id: beacon_id});
// });
