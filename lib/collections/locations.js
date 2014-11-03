Locations = new Meteor.Collection('locations');

/**
 * - belongs to a {@link Company}
 * - has many {@link Installation}
 * - has many {@link Product} thru {@link Installation}
 * - has many {@link Beacon} thru {@link Installation}
 *
 * @param companyId
 * @param name
 * @param address
 * @param coordinate
 * @constructor
 *
 * @property companyId
 * @property name
 * @property address
 * @property coordinate
 */
Location = function(companyId, name, address, coordinate) {
  // companyId & name will be used as primary keys.
  this.companyId = companyId;
  this.name = name;
  this.address = address;
  this.coordinate = coordinate;
}

Location.prototype.save = function() {
  var selector = {
    companyId: this.companyId,
    name: this.name
  };
  var modifier = {
    $set: {
      address: this.address,
      coordinate: this.coordinate
    }
  };
  var result = Locations.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Locations.findOne(selector)._id;
  }
  return this._id;
}

Location.prototype.entranceInstallationIds = function() {
  var installs = Installations.find({locationId: this._id, type: 'entrance'});
  return Installations.find({locationId: this._id, type: 'entrance'}).map(mapId);
}

Location.prototype.productInstallationId = function(productId) {
  return Installations.find({
    locationId: this._id,
    productId: productId
  }).map(mapId);
};

Location.prototype.cashierInstallationIds = function() {
  return Installations.find({locationId: this._id, type: 'cashier'}).map(mapId);
}

Location.prototype.funnel = function(productId, timeRange) {
  var timeRange = timeRange || defaultTimeRange();
  var funnel = {entrances: 0, product: 0, cashiers: 0};

  // Entrance
  var entranceEncounters = Encounters.find({installationId: {$in: this.entranceInstallationIds()},
                                            enteredAt: timeRange,
                                            exitedAt:  timeRange });
  funnel.entrances = entranceEncounters.count();

  // Return if we couldn't find given product
  var productInstallation = Installations.findOne({
    locationId:this._id,
    productId: productId
  });
  if (!productInstallation) {
    console.log("Cannot find product["+productId+"] in Location["+this._id+"]");
    return funnel;
  }

  // Product
  var productEncounters = Encounters.find({installationId: productInstallation._id,
                                           enteredAt: timeRange,
                                           exitedAt:  timeRange});

  // Cashiers
  var cashierInstallationIds = this.cashierInstallationIds();
  productEncounters.forEach(
    // Find the first encounter to any cashier installations after the
    // visitor visited the given product.
    function(productEncounter) {
      var visitorId = productEncounter.visitorId;
      var cashierEncounter = Encounters.find({installationId: {$in: cashierInstallationIds},
                                              visitorId: productEncounter.visitorId,
                                              enteredAt: {$gt: productEncounter.exitedAt},
                                              exitedAt: timeRange},
                                             {sort: {enteredAt: 1}, limit: 1});
      funnel.product += 1;
      if (cashierEncounter.count() > 0) {
        funnel.cashiers += 1;
      }
    }
  );

  console.log("Location["+this._id+"].funnel("+productId+"): " + JSON.stringify(funnel));
  return funnel;
}

var mapId = function(object, index, cursor) {
  return object._id;
}

var defaultTimeRange = function() {
  // Do not query about first BeaconEvent every time.
  // return {$gte: BeaconEvents.findOne({},{sort:{createdAt:1}}).createdAt};
  return {$gte: 1400345402000};
}
