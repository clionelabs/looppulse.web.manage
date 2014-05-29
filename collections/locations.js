Locations = new Meteor.Collection('locations');

Location = function(name, address, companyId) {
  this.name = name;
  this.address = address;
  this.companyId = companyId;
}

Location.prototype.save = function() {
  Locations.upsert(this, this);
  this._id = Locations.findOne(this)._id;
  return this._id;
}

Location.load = function(id) {
  var json = Locations.findOne({_id: id});
  var loaded = new Location(json.name, json.address, json.companyId);
  loaded._id = json._id;
  return loaded;
}

// Create a location object based on the obj given
Location.create = function(arg) {
  if (!arg) {
    return null;
  }
  var obj = (arg && arg == "object") ? arg : Locations.findOne(arg);
  var location = new Location(obj.name, obj.address, obj.companyId);
  location._id = obj._id;
  return location;
}

Location.prototype.entranceInstallationIds = function() {
  var installs = Installations.find({locationId: this._id, type: 'entrance'});
  return Installations.find({locationId: this._id, type: 'entrance'}).map(mapId);
}

Location.prototype.productInstallationId = function(productId) {
  return Installations.find({locationId: this._id,
                             type: 'product',
                             physicalId: productId}).map(mapId);
}

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
  var productInstallation = Installations.findOne({locationId:this._id,
                                                   type: 'product',
                                                   physicalId: productId});
  if (!productInstallation) {
    console.log('Cannot find product with ID: [location] ' + this._id + ' / [product]' +productId);
    return funnel;
  }

  // Product
  var productEncounters = Encounters.find({installationId: productInstallation._id,
                                           enteredAt: timeRange,
                                           exitedAt:  timeRange});
  funnel.product = productEncounters.count();

  // Cashier after visiting Product
  var visitorIds = productEncounters.map(function(encounter, index, cursor) {
                                           return encounter.visitorId;
                                         });
  var cashierEncounters = Encounters.find({installationId: {$in: this.cashierInstallationIds()},
                                           visitorId: {$in: visitorIds},
                                           enteredAt: timeRange,
                                           exitedAt:  timeRange});
  funnel.cashiers = cashierEncounters.count();

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
