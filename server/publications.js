Meteor.publish('company', function(_id) {
  return Companies.findOne(_id);
});

Meteor.publish('locations', function(company_id) {
  return Locaitons.find({company_id: company_id});
});

Meteor.publish('location', function(_id) {
  return Locations.findOne(_id);
});

Meteor.publish('beacons', function(location_id) {
  var products = Products.find({location_id: location_id});
  return products.map(function(product, index, ref) {
    Beacons.findOne({product_id: product._id},
                    {fields: {uuid: 0, major: 0, minor: 0}});
  });
});

Meteor.publish('encounters', function(beacon_id) {
  return Encounters.find({beacon_id: beacon_id});
});
