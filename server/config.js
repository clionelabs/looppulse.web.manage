configure = function() {
  console.log("Configuring with Meteor.settings: " + JSON.stringify(Meteor.settings));

  if (JSON.stringify(Meteor.settings)=='{}') {
    console.log("Meteor.settings expected. Rerun: meteor --settings server/settings.json");

    // We can try to read the file using
    // https://gist.github.com/awatson1978/4625493
  }
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

// TODO: We need to observe other changes in company.
observerCompaniesFromFirebase = function() {
  var fbPath = Meteor.settings.firebase.config + '/companies';
  var companiesRef = new Firebase(fbPath);
  console.log("Observing for company addition: "+ fbPath);
  companiesRef.on(
    "child_added",
    Meteor.bindEnvironment(
      function(childSnapshot, prevChildName) {
        createCompany(childSnapshot, Meteor.settings.removeFromFirebase);
      }
    )
  );
}

var createCompany = function(snapshot, removeFromFirebase) {
  var companyConfig = snapshot.val();
  var company = new Company(companyConfig.name, companyConfig.logoUrl);
  companyConfig._id = company.save();
  console.log("Company created: " + JSON.stringify(company));

  _.each(companyConfig.products, function(productConfig, productKey) {
    var p = new Product(productConfig.name, company._id);
    companyConfig.products[productKey]._id = p.save();
    console.log("Product created: " + JSON.stringify(p));
  });

  _.each(companyConfig.beacons, function(beaconConfig, beaconKey) {
    var b = new Beacon(beaconConfig.uuid, beaconConfig.major, beaconConfig.minor);
    companyConfig.beacons[beaconKey]._id = b.save();
    console.log("Beacon created: " + JSON.stringify(b));
  });

  _.each(companyConfig.locations, function(locationConfig, locationKey) {
    var l = new Location(locationConfig.name, locationConfig.address, company._id);
    companyConfig.locations[locationKey]._id = l.save();
    console.log("Location created: " + JSON.stringify(l));

    _.each(locationConfig.installations, function(installationConfig) {
      var type = installationConfig.type;
      var locationId = l._id;
      var beaconId = companyConfig.beacons[installationConfig.beacon]._id;
      var physicalId = undefined;
      if (type === 'product') {
        physicalId = companyConfig.products[installationConfig.product]._id;
      }
      var i = new Installation(type, locationId, beaconId, physicalId);
      i.save();
      console.log("Installtion created: " + JSON.stringify(i));
    });
  });

  if (removeFromFirebase) {
    removeCompanyFromFirebase(snapshot.ref());
  }
}

// TODO: refactor w/ removeBeaconEventFromFirebase()
var removeCompanyFromFirebase = function(ref) {
  // beaconEventRef can be passed in as DataSnapshot
  var fb = new Firebase(ref.toString());
  fb.remove();
  console.log('Removed: ' + ref);
}
