Company.ensureIndex = function () {
  Companies._ensureIndex({
    ownedByUserIds: 1
  });
};

Company.prototype.firebaseRef = function() {
  return this.systemConfig.firebase.root + "/companies/" + this._id.toString();
};

Company.prototype.generateBeaconEventsRef = function() {
  return this.firebaseRef() + "/beacon_events";
};

Company.prototype.generateEngagementEventsRef = function() {
  return this.firebaseRef() + "/engagement_events";
};

Company.prototype.generateVisitorEventsRef = function() {
  return this.firebaseRef() + "/visitor_events";
}

Company.prototype.generateLocationsJSON = function() {
  var json = {};
  Locations.find({companyId: this._id}).forEach(function(location) {
    var installationsJSON = {};
    Installations.find({locationId: location._id}).forEach(function(installation) {
      installationsJSON[installation.name] = installation.denormalizedJSON();
    });
    json[location.name] = {"installations": installationsJSON};
  });
  return json;
}

Company.prototype.generateProductsJSON = function() {
  var json = {};
  Products.find({companyId: this._id}).forEach(function(product) {
    var category = Categories.findOne({_id: product.categoryId}).name;
    json[product.name] = {"name": product.name, "category": category, "type": product.type};
  });
  return json;
}

// This is a JSON returned after successfully authenticated
Company.prototype.authenticatedResponse = function() {
  var systemConfig = this.systemConfig;
  var tokenGenerator = new FirebaseTokenGenerator(systemConfig.firebase.rootSecret);
  var token = tokenGenerator.createToken(
    {companyId: this._id},
    {admin: true}  // FIXME config Firebase security role per company
  );
  _.extend(systemConfig, {
    "firebase": {
      "token": token,
      "root": this.firebaseRef(),
      "beacon_events": this.generateBeaconEventsRef(),
      "engagement_events": this.generateEngagementEventsRef(),
      "visitor_events": this.generateVisitorEventsRef()
    },
    "locations": this.generateLocationsJSON(),
    "products": this.generateProductsJSON()
  });
  return systemConfig;
};
