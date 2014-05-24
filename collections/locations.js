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

Location.prototype.entranceInstallationIds = function() {
  Installations.find({locationId: _id, type: 'entrance'}).map(
    function(installation, index, cursor) {
      return installation._id;
    }
  );
}

Location.prototype.productInstallationId= function(productId) {
  Installations.find({locationId: _id, type: 'product', physicalId: productId}).map(
    function(installation, index, cursor) {
      return installation._id;
    }
  );
}

Location.prototype.cashierInstallationIds = function() {
  Installations.find({locationId: _id, type: 'cashier'}).map(
    function(installation, index, cursor) {
      return installation._id;
    }
  );
}



Location.prototype.funnel = function(productId, timeRange) {
  var funnel = {entrances: 0, product: 0, cashiers: 0};
  var timeStart = timeRange.start;
  var timeEnd = timeRange.end;

  // Entrance
  entranceEncounters = Encounters.find({installationId: {$in: this.entranceInstallationIds},
                                        enteredAt: {$gte: timeStart, $lt: timeEnd},
                                        exitedAt:  {$gte: timeStart, $lt: timeEnd}});
  funnel.entrances = entranceEncounters.count();

  // Return if we couldnt' find given product
  if (!Installations.findOne({locationId:this._id, physicalId: productId, type: 'product'})) {
    console.log('Cannot find product with ID: ' + productId);
    return funnel;
  }

  // Product
  productEncounters = Encounters.find({installationId: {$in: this.productInstallationId(productId)},
                                       enteredAt: {$gte: timeStart, $lt: timeEnd},
                                       exitedAt:  {$gte: timeStart, $lt: timeEnd}});
  funnel.product = productEncounters.count();

  // Cashier after visiting Product
  visitorIds = productEncounters.map(
    function(encounter, index, cursor) {
      return encounter.visitorId;
    }
  );
  funnel.cashiers = Encounters.find({installationId: {$in: this.cashierInstallationIds},
                                     visitorId: {$in: visitorIds},
                                     enteredAt: {$gte: timeStart, $lt: timeEnd},
                                     exitedAt:  {$gte: timeStart, $lt: timeEnd}});
  return funnel;
}
