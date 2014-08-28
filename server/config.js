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
};

var observeCompaniesFromFirebase = function() {
  var fbPath = Meteor.settings.firebase.config + '/companies';
  var companiesRef = new Firebase(fbPath);
  console.log("[Remote] Observing for company addition: "+ fbPath);
  companiesRef.on(
    "child_added",
    Meteor.bindEnvironment(function(childSnapshot, prevChildName) {
      configureCompany(childSnapshot.val());
    })
  );
};

var configureCompanyFromJSON = function (companyJSON) {
  // companyJSON has to be a JSON file in /private
  console.info("[Init] Configuring a company from: ", companyJSON);
  var file = Assets.getText(companyJSON);
  companyConfig = JSON.parse(file);
  configureCompany(companyConfig);
};

var configureCompany= function (companyConfig) {
  console.info("[Init] Configuring " + companyConfig.name + " with (" +
                _.keys(companyConfig.products) + ") products and (" +
                _.keys(companyConfig.locations) + ") locations.");

  // Company
  var company = new Company(companyConfig.name, companyConfig.logoUrl);
  companyConfig._id = company.save();
  console.info("[Init] Company created:", company._id, company.name);

  // Categories
  _.each(companyConfig.categories, function(categoryConfig, categoryKey) {
    var category = new Category({
      companyId: company._id,
      name: categoryConfig.name
    });
    companyConfig.categories[categoryKey]._id = category.save();
    console.info("[Init] Category created:", category._id, category.name);
  });

  // Products
  _.each(companyConfig.products, function(productConfig, productKey) {
    var categoryConfig = companyConfig.categories[productConfig.category];
    if (!categoryConfig) {
      console.error("[Init] Can not find category [%s] for product [%s]", productConfig.category, productConfig.name);
      return;
    }
    var categoryId = categoryConfig._id;
    var p = new Product({
      name: productConfig.name,
      companyId: company._id,
      categoryId: categoryId
    });
    companyConfig.products[productKey]._id = p.save();
    console.info("[Init] Product created:", p._id, p.name);
  });

  // Locations
  _.each(companyConfig.locations, function(locationConfig, locationKey) {
    var location = new Location(locationConfig.name, locationConfig.address, company._id);
    companyConfig.locations[locationKey]._id = location.save();
    console.info("[Init] Location created:", location._id, location.name);

    _.each(locationConfig.installations, function(installationConfig, installationKey) {
      var data = companyConfig.products[installationConfig.product];
      if (!data) {
        console.error("[Init] Error creating installation", installationConfig.product, JSON.stringify(companyConfig))
      }
      var type = data.type || "product";
      var physicalId = data._id;

      var locationId = location._id;
      var name = installationConfig.name;
      name = !name ? data.name : name; // only override the name label if no given name
      var coord = installationConfig.coordinate;

      // Floor
      // TODO create floor definitions dictionary + attach floorId to Installation?
      if (coord.z) {
        var floor = new Floor({
          locationId: location._id,
          level: coord.z,
          name: coord.z + "/F"
        });
        floor.save();
      }

      var beaconId = null;
      {
        var beaconConfig = installationConfig.beacon;
        var beacon = new Beacon(beaconConfig.proximityUUID, beaconConfig.major, beaconConfig.minor);
        beaconId = beacon.save();
      }
      var installation = new Installation(type, locationId, beaconId, physicalId, name, coord);
      locationConfig.installations[installationKey]._id = installation.save();
      console.info("[Init] Installation created:", JSON.stringify(installation));
    });

    // Engagements
    _.each(locationConfig.engagements, function(engagementConfig) {
      var installationKeyToId = function (key) {
        return locationConfig.installations[key]._id;
      };
      var triggerInstallationIds = _.map(engagementConfig.triggerInstallations,
                                         installationKeyToId);
      var recommendInstallationIds = _.map(engagementConfig.recommendInstallations,
                                           installationKeyToId);

      var replaceInstallationKeysWithIds = function (keyMessages) {
        var installationIdsToMessages = {};
        _.each(message, function(message, key) {
          installationId = installationKeyToId(key);
          installationIdsToMessages[installationId] = message;
        });
        return installationIdsToMessages;
      };
      var message = engagementConfig.message;
      if (engagementConfig.type === RecommendationEngagement.type) {
        message = replaceInstallationKeysWithIds(engagementConfig.message);
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

};

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
    if (debugConfig.seedData) {
      configureCompanyFromJSON(debugConfig.seedData);
    } else {
      observeCompaniesFromFirebase();
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
