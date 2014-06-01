configure = function() {
  console.log("Configuring with Meteor.settings: " + JSON.stringify(Meteor.settings));

  if (JSON.stringify(Meteor.settings)=='{}') {
    console.log("Meteor.settings expected. Rerun: meteor --settings server/settings.json");

    // We can try to read the file using
    // https://gist.github.com/awatson1978/4625493
  }

  buildDemoData();
}

ensureIndexes = function() {
  var classes = [BeaconEvent, Encounter, Installation, Visitor];
  classes.forEach(
    function(objectClass) {
      if (objectClass.hasOwnProperty('ensureIndex')) {
        objectClass.ensureIndex();
      }
    }
  )
}

var buildDemoData = function() {
  if (Companies.find().count()==0) {
    console.log("Demo data not found. Rebuilding...")
    var companyName = 'Marathon Sports';
    company = new Company(companyName,
                          'http://www.ilovelkf.hk/sites/www.ilovelkf.hk/files/business/image_promo/marathon-sports-logo-promo.png');
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
