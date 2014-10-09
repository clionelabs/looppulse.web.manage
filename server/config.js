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
  var classes = [BeaconEvent, Encounter, Installation, Metric, SegmentVisitor, Visitor];
  classes.forEach(
    function(objectClass) {
      if (objectClass.hasOwnProperty('ensureIndex')) {
        objectClass.ensureIndex();
      }
    }
  )
};

observeCompaniesFromFirebaseDEBUG = function() {
  var fbPath = Meteor.settings.firebase.config + '/companies';
  var companiesRef = new Firebase(fbPath);
  console.log("[Remote] Observing for company addition: "+ fbPath);
  companiesRef.on(
    "child_added",
    Meteor.bindEnvironment(function(childSnapshot, prevChildName) {
      var configurationJSON = childSnapshot.ref().toString()+".json";
      configureCompany(childSnapshot.val(), configurationJSON);
    })
  );
};

var configureCompanyFromJSON = function (companyJSON) {
  // companyJSON has to be a JSON file in /private
  console.info("[Init] Configuring a company from: ", companyJSON);
  var file = Assets.getText(companyJSON);
  companyConfig = JSON.parse(file);
  configureCompany(companyConfig, companyJSON);
};

var configureCompany= function (companyConfig, configurationJSON) {
  console.info("[Init] Configuring " + companyConfig.name + " with (" +
                _.keys(companyConfig.products) + ") products and (" +
                _.keys(companyConfig.locations) + ") locations from " +
                configurationJSON);
  //TODO to be removed once there are multiple user.
  var admin = Meteor.users.findOne();
  // Company
  var company = new Company(companyConfig.name, companyConfig.system, configurationJSON, [ admin._id ]);
  companyConfig._id = company.save();
  console.info("[Init] Company created:", company._id, company.name);

  // Application
  _.each(companyConfig.applications, function(appConfig) {
    var app = Applications.findOne({companyId: companyConfig._id, name: appConfig.name});
    if (!app) {
      app = new Application({ companyId: companyConfig._id,
                              name: appConfig.name,
                              token: appConfig.token,
                              _id: appConfig.applicationId});
      app.save();

      app = Applications.findOne({companyId: companyConfig._id, name: appConfig.name});
    }
    console.info("[Init] Application created: ", app._id, app.name);
  });

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
      categoryId: categoryId,
      type: productConfig.type || "product"
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
      var productId = data._id;

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
      var installation = new Installation({
        locationId: locationId,
        beaconId: beaconId,
        productId: productId,
        name: name,
        coord: coord
      });
      locationConfig.installations[installationKey]._id = installation.save();
      console.info("[Init] Installation created:", JSON.stringify(installation));
    });

    // Segments
    _.each(companyConfig.segments, function(segmentConfig, segmentKey) {
      var criteria = segmentConfig.criteria || {};
      if (criteria.locations) {
        criteria.locationIds = _.map(criteria.locations, function(locationKey) {
          return companyConfig.locations[locationKey]._id;
        });
        delete criteria.locations;
      }
      // convert `triggerLocations` to use "ids"
      if (criteria.triggerLocations) {
        var replaceCategoryKeyWithId = function(triggerLocationConfig) {
          if (triggerLocationConfig.categoryName) {
            var selector = {companyId: company._id, name: triggerLocationConfig.categoryName};
            var category = Categories.findOne(selector);
            if (!category) {
              console.log("Can not find category:", selector);
            }
            triggerLocationConfig.categoryId = category._id;
            delete triggerLocationConfig.categoryName;
          }
        };
        var replaceProductKeyWithId = function(triggerLocationConfig) {
          if (triggerLocationConfig.productName) {
            var product = Products.findOne({companyId: company._id, name: triggerLocationConfig.productName});
            triggerLocationConfig.productId = product._id;
            delete triggerLocationConfig.productName;
          }
        };
        _.each(segmentConfig.criteria.triggerLocations, function(triggerLocationConfig) {
          replaceCategoryKeyWithId(triggerLocationConfig);
          replaceProductKeyWithId(triggerLocationConfig);
        });
      }
      if (criteria.days) {
        if (criteria.days.start) {
          criteria.start = Date.parse(criteria.start);
        }
        if (criteria.days.end) {
          criteria.end = Date.parse(criteria.end);
        }
      }

      var segment = new Segment({
        companyId: company._id,
        name: segmentConfig.name,
        criteria: criteria
      });
      segment.save();
      companyConfig.segments[segmentKey]._id = segment._id;
      console.info("[Init] Segment created:", JSON.stringify(segment));
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
      var stopInstallationIds = _.map(engagementConfig.stopInstallations,
                                      installationKeyToId);

      var replaceInstallationKeysWithIds = function (keyMessages) {
        var installationIdsToMessages = {};
        _.each(keyMessages, function(message, key) {
          installationId = installationKeyToId(key);
          installationIdsToMessages[installationId] = message;
        });
        return installationIdsToMessages;
      };

      var segmentId = companyConfig.segments[engagementConfig.segment]._id;
      var validPeriod = engagementConfig.validPeriod;
      if (validPeriod) {
        if (validPeriod.start) {
          validPeriod.start = Date.parse(validPeriod.start)
        }
        if (validPeriod.end) {
          validPeriod.end = Date.parse(validPeriod.end);
        }
      }
      var context = replaceInstallationKeysWithIds(engagementConfig.context);
      var e = {
        type: engagementConfig.type,
        name: engagementConfig.name,
        validPeriod: validPeriod,
        segmentId: segmentId,
        locationId: companyConfig.locations[locationKey]._id,
        context: context,
        triggerWhen :engagementConfig.triggerWhen,
        triggerInstallationIds: triggerInstallationIds,
        recommendInstallationIds: recommendInstallationIds,
        stopInstallationIds: stopInstallationIds
      };
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

useSeedData = function() {
  return Meteor.settings.DEBUG.seedData;
}

configureDEBUG = function() {
  var debugConfig = Meteor.settings.DEBUG;
  if (debugConfig && JSON.stringify(debugConfig) != "{}") {
    console.info("[Dev] Applying DEBUG options: ", debugConfig);
    if (debugConfig.resetLocal) {
      resetLocal();
    }
    if (useSeedData()) {
      configureCompanyFromJSON(debugConfig.seedData);
    }
  }

  Debug.observeChanges();
};

var resetLocal = function() {
  var collections = [BeaconEvents, Encounters, Visitors, Metrics, Messages];
  collections.forEach(function(collection) {
    collection.remove({});
    console.info("[Reset] Removed all data in:", collection._name);
  });
}
