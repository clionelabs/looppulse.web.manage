if (Meteor.isServer) {
  Meteor.startup(
    Meteor.bindEnvironment(function(){
      console.log("Environment Setup.")
      buildDemoData();
    })
  );
}

// Observe raw event from Firebase
firebaseEventsRef = new Firebase('https://looppulse-dev.firebaseio.com/beacon_events');
firebaseEventsRef.on(
  'child_added',
   Meteor.bindEnvironment(
     function(childSnapshot, prevChildName) {
       //log(childSnapshot.val().type, childSnapshot.val());
       processBeaconEvent(childSnapshot.val());
     }
   )
);

var processBeaconEvent = function(beaconEventJSON) {
  var visitor = new Visitor(beaconEventJSON.visitor_uuid);
  visitor.save();

  var beacon = Beacons.findOne({uuid: beaconEventJSON.uuid,
                                major: beaconEventJSON.major,
                                minor: beaconEventJSON.minor});
  if (!beacon) {
    //console.log("can't find beacon: " + JSON.stringify(beaconEventJSON));
    return;
  }
  var beaconEvent = new BeaconEvent(visitor._id, beacon._id, beaconEventJSON);
  if (beaconEvent.save()) {
    // Exit event marks the end of an encounter.
    if (beaconEvent.isExit()) {
      var installation = Installations.findOne({beaconId: beacon._id});
      var encounter = new Encounter(visitor._id, installation._id, beaconEvent.createdAt);
      encounter.save();
    }
  }
}

var buildDemoData = function() {
  console.log("DB checking")
  if (Companies.find().count()==0) {
    console.log("Core Data not found. Rebuild db...")
    var companyName = 'Marathon Sports';
    company = new Company(companyName, 'http://www.ilovelkf.hk/sites/www.ilovelkf.hk/files/business/image_promo/marathon-sports-logo-promo.png');
    company.save();

    var location = new Location('Causeway Bay Store', 'Shop 616, L6, Times Squaocaocnre, Causeway Bay', company._id);
    location.save();

    var demoProducts = ['Kids', 'Men', 'Women'];
    var demoBeacons = [{uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', major: 28364, minor: 4756},
                       {uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', major: 54330, minor: 38700},
                       {uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', major: 58020, minor: 34876},
                       {uuid: '74278BDA-B644-4520-8F0C-720EAF059935', major: 100,   minor: 0},
                       {uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0', major: 10,    minor: 47}];
    demoProducts.forEach(function(element, index, array) {
      var product = new Product(element, company._id);
      product.save();

      var beacon = new Beacon(demoBeacons[index].uuid,
                              demoBeacons[index].major,
                              demoBeacons[index].minor);
      beacon.save();

      var installation = new Installation(location._id, beacon._id, product._id, 'product');
      installation.save();
    });

    // Entrance & Cashier
    var entrance = new Entrance('Main');
    entrance.save();
    beacon = new Beacon(demoBeacons[3].uuid,
                        demoBeacons[3].major,
                        demoBeacons[3].minor);
    beacon.save();
    installation = new Installation(location._id, beacon._id, entrance._id, 'entrance');
    installation.save();

    var cashier = new Cashier('Main');
    cashier.save();
    beacon = new Beacon(demoBeacons[4].uuid,
                        demoBeacons[4].major,
                        demoBeacons[4].minor);
    beacon.save();
    installation = new Installation(location._id, beacon._id, cashier._id, 'cashier');
    installation.save();

    Beacons.find().forEach(function(b, i, a) {
      console.log("created beacon: " + JSON.stringify(b));
    });
    Installations.find().forEach(function(b, i, a) {
      console.log("created installation: " + JSON.stringify(b));
    });
  }
}

var log = function(eventName, beaconEvent) {
  console.log(eventName + ' | Beacon ' + beaconEvent.major + ' : ' + beaconEvent.minor);
}
