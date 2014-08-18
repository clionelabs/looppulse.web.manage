configure = function() {
  console.info("Configuring with Meteor.settings: " + JSON.stringify(Meteor.settings));

  if (JSON.stringify(Meteor.settings) === '{}') {
    console.warn("Meteor.settings expected. Rerun: meteor --settings server/settings.json");

    // We can try to read the file using
    // https://gist.github.com/awatson1978/4625493
  }

  if (Meteor.settings.aws) {
    Uploader.config({
      key: Meteor.settings.aws.accessKeyId,
      secret: Meteor.settings.aws.secretAccessKey,
      bucket: Meteor.settings.aws.s3bucket
    });
  } else {
    console.warn("AWS settings missing");
  }
};

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
observeCompaniesFromFirebase = function() {
  var fbPath = Meteor.settings.firebase.config + '/companies';
  var companiesRef = new Firebase(fbPath);
  console.log("[Remote] Observing for company addition: "+ fbPath);
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
  console.info("[Init] Company created:", company._id, company.name);

  _.each(companyConfig.products, function(productConfig, productKey) {
    var p = new Product({
      name: productConfig.name,
      companyId: company._id
    });
    companyConfig.products[productKey]._id = p.save();
    console.info("[Init] Product created:", p._id, p.name);
  });

  _.each(companyConfig.entrances, function(entranceConfig, entranceKey) {
    var p = new Entrance(entranceConfig.name, company._id);
    companyConfig.entrances[entranceKey]._id = p.save();
    console.info("[Init] Entrance created:", p._id, p.name);
  });

  _.each(companyConfig.cashiers, function(cashierConfig, cashierKey) {
    var p = new Cashier(cashierConfig.name, company._id);
    companyConfig.cashiers[cashierKey]._id = p.save();
    console.info("[Init] Cashier created:", p._id, p.name);
  });

  _.each(companyConfig.beacons, function(beaconConfig, beaconKey) {
    var b = new Beacon(beaconConfig.uuid, beaconConfig.major, beaconConfig.minor);
    companyConfig.beacons[beaconKey]._id = b.save();
    console.info("[Init] Beacon created:", JSON.stringify(b));
  });

  _.each(companyConfig.locations, function(locationConfig, locationKey) {
    var l = new Location(locationConfig.name, locationConfig.address, company._id);
    companyConfig.locations[locationKey]._id = l.save();
    console.info("[Init] Location created:", l._id, l.name);

    _.each(locationConfig.installations, function(installationConfig) {
      var type = installationConfig.type;
      var locationId = l._id;
      var beaconId = companyConfig.beacons[installationConfig.beacon]._id;
      var physicalId = null;
      var name = installationConfig.name;
      var coord = installationConfig.coord;
      var data = null;

      // load the data object according to its type
      if (type === 'product') {
        data = companyConfig.products[installationConfig.product]
      } else if (type === 'entrance') {
        data = companyConfig.entrances[installationConfig.entrance];
      } else if (type === 'cashier') {
        data = companyConfig.cashiers[installationConfig.cashier];
      }

      if (!data) {
        console.error("[Init] Error creating installation", JSON.stringify(companyConfig))
      }
      //write the data
      physicalId = data._id;
      name = !name ? data.name : name; // only override the name label if no given name
      var insta = new Installation(type, locationId, beaconId, physicalId, name, coord);
      insta.save();
      console.info("[Init] Installation created:", JSON.stringify(insta));
    });

    _.each(locationConfig.engagements, function(engagementConfig) {
      var beaconKeyToInstallationId = function (beaconKey) {
        var beaconId = companyConfig.beacons[beaconKey]._id;
        var installation = Installations.findOne({ beaconId: beaconId });
        return installation._id;
      }

      var triggerInstallationIds = _.map(engagementConfig.triggerBeacons,
                                         beaconKeyToInstallationId);
      var recommendInstallationIds = _.map(engagementConfig.recommendBeacons,
                                           beaconKeyToInstallationId);
      var replaceBeaconKeyWithInstallationIds = function (beaconKeyMessages) {
        var installationIdsToMessages = {};
        _.each(message, function(message, key) {
          installationId = beaconKeyToInstallationId(key);
          installationIdsToMessages[installationId] = message;
        })
        return installationIdsToMessages;
      }
      var message = engagementConfig.message;
      if (engagementConfig.type === RecommendationEngagement.type) {
        message = replaceBeaconKeyWithInstallationIds(engagementConfig.message);
      }
      var e = { type: engagementConfig.type,
                locationId: companyConfig.locations[locationKey]._id,
                message: message,
                triggerInstallationIds: triggerInstallationIds,
                recommendInstallationIds: recommendInstallationIds };
      Engagements.upsert(e, e);
      var reloaded = Engagements.findOne(e);
      console.info("[Init] Engagement created:", JSON.stringify(reloaded));
    })
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
  console.info('[Reset] Firebase Removed:',ref);
}

configureDEBUG = function() {
  var debugConfig = Meteor.settings.DEBUG;
  if (debugConfig && JSON.stringify(debugConfig) != "{}") {
    console.info("[Dev] Applying DEBUG options: ", debugConfig);
    if (debugConfig.resetLocal) {
      resetLocal();
    }
  }

  Debug.observeChanges();
};

var resetLocal = function() {
  var collections = [BeaconEvents, Encounters, Visitors, Metrics, Funnels, Messages];
  collections.forEach(function(collection) {
    collection.remove({});
    console.info("[Reset] Removed all data in:", collection._name);
  });
}
