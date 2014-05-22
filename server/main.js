Meteor.startup(function() {
  buildDemoData();
});

// Observe raw event from Firebase
firebaseEventsRef = new Firebase('https://looppulse-dev.firebaseio.com/beacon_events');
firebaseEventsRef.on(
  'child_added',
   Meteor.bindEnvironment(
     function(childSnapshot, prevChildName) {
       log(childSnapshot.val().type, childSnapshot.val());
       processBeaconEvent(childSnapshot.val());
     }
   )
);

var processBeaconEvent = function(beaconEventJSON) {
  var visitor = new Visitor(beaconEventJSON.visitor_uuid);
  visitor.save();

  var beacon = new Beacon(beaconEventJSON.uuid, beaconEventJSON.major, beaconEventJSON.minor);
  beacon.save();

  var beaconEvent = new BeaconEvent(visitor, beacon, beaconEventJSON);
  if (beaconEvent.save()) {
    // Exit event marks the end of an encounter.
    if (beaconEvent.isExit()) {
      var encounter = new Encounter(visitor._id, beacon._id, beaconEvent.createdAt);
      encounter.save();
    }
  }
}

var log = function(eventName, beaconEvent) {
  console.log(eventName + ' | Beacon ' + beaconEvent.major + ' : ' + beaconEvent.minor + ' | ' + beaconEvent);
}

var buildDemoData = function() {
  if (Companies.find().count()==0) {

    var companyName = 'Marathon Sports';
    company = new Company(companyName, 'http://www.ilovelkf.hk/sites/www.ilovelkf.hk/files/business/image_promo/marathon-sports-logo-promo.png');
    company.save();

    var location = new Location('Causeway Bay Store', 'Shop 616, L6, Times Squaocaocnre, Causeway Bay', company._id);
    location.save();

    var demoProducts = ['Kids', 'Men', 'Women'];
    var demoBeacons = [{uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', major: 28364, minor: 4756},
                   {uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', major: 54330, minor: 38700},
                   {uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0', major: 10,    minor: 47}];
    demoProducts.forEach(function(element, index, array) {
      var product = new Product(element, company._id);
      product.save();

      var beacon = new Beacon(demoBeacons[index].uuid,
                              demoBeacons[index].major,
                              demoBeacons[index].minor,
                              product._id,
                              location._id);
      beacon.save();
    });
  }
}
