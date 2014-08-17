configure = function() {
  console.info("Configuring with Meteor.settings: " + JSON.stringify(Meteor.settings));

  if (JSON.stringify(Meteor.settings)=='{}') {
    console.warn("Meteor.settings expected. Rerun: meteor --settings server/settings.json");

    // We can try to read the file using
    // https://gist.github.com/awatson1978/4625493
  }

  configureDEBUG();
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

var configureCompanyFromJSON = function (companyJSON) {
  // companyJSON has to be a JSON file in /private
  console.info("[Init] Configuring a company from: ", companyJSON);
  var file = Assets.getText(companyJSON);
  companyConfig = JSON.parse(file);
  console.info("[Init] Configuring " + companyConfig.name + " with (" +
                _.keys(companyConfig.products) + ") products and (" +
                _.keys(companyConfig.locations) + ") locations.");

  // Company
  var company = new Company(companyConfig.name, companyConfig.logoUrl);
  companyConfig._id = company.save();
  console.info("[Init] Company created:", company._id, company.name);

  // Products
  _.each(companyConfig.products, function(productConfig, productKey) {
    var p = new Product({
      name: productConfig.name,
      companyId: company._id
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
      var type = installationConfig.type || "product";
      var data = null;
      var physicalId = null;
      // load the data object according to its type
      {
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
        physicalId = data._id;
      }

      var locationId = location._id;
      var name = installationConfig.name;
      name = !name ? data.name : name; // only override the name label if no given name
      var coord = installationConfig.coordinate;

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
      }
      var triggerInstallationIds = _.map(engagementConfig.triggerInstallations,
                                         installationKeyToId);
      var recommendInstallationIds = _.map(engagementConfig.recommendInstallations,
                                           installationKeyToId);

      var replaceInstallationKeysWithIds = function (keyMessages) {
        var installationIdsToMessages = {};
        _.each(message, function(message, key) {
          installationId = installationKeyToId(key);
          installationIdsToMessages[installationId] = message;
        })
        return installationIdsToMessages;
      }
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

}

// TODO: refactor w/ removeBeaconEventFromFirebase()
var removeCompanyFromFirebase = function(ref) {
  // beaconEventRef can be passed in as DataSnapshot
  var fb = new Firebase(ref.toString());
  fb.remove();
  console.info('[Reset] Firebase Removed:',ref);
}

var configureDEBUG = function() {
  var debugConfig = Meteor.settings.DEBUG;
  if (debugConfig && JSON.stringify(debugConfig) != "{}") {
    console.info("[Dev] Applying DEBUG options: ", debugConfig);
    if (debugConfig.resetLocal) {
      resetLocal();
    }
    if (debugConfig.seedData) {
      configureCompanyFromJSON(debugConfig.seedData);
    }
  }

  Debug.observeChanges();
}

var resetLocal = function() {
  var collections = [BeaconEvents, Encounters, Visitors, Metrics, Funnels, Messages];
  collections.forEach(function(collection) {
    collection.remove({});
    console.info("[Reset] Removed all data in:", collection._name);
  });
}
