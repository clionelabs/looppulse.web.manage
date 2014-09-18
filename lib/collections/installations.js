Installations = new Meteor.Collection('installations', {
  transform: function(doc) {
    return new Installation(doc);
  }
});

Installations.findByCompany = function(companyId) {
  var locationIds = Locations.find({ companyId: companyId }).map(function(location) {
    return location._id;
  });
  return Installations.find({
    locationId: { $in: locationIds }
  });
};

/**
 * - belongs to a {@link Location}
 * - belongs to a {@link Beacon}
 * - belongs to one of the followings: {@link Product}, {@link Entrance}, {@link Cashier}
 *
 * @param type
 * @param locationId
 * @param beaconId
 * @param physicalId
 * @param name
 * @param coord
 * @constructor
 *
 * @property {string} type  - possible values: entrance, product, cashier
 * @property locationId
 * @property beaconId
 * @property physicalId
 * @property name
 * @property coord
 */
Installation = function(doc) {
  _.extend(this, doc);
};

Installation.prototype.save = function() {
  Installations.upsert(this, this);
  this._id = Installations.findOne(this)._id;
  return this._id;
};

Installation.prototype.isEntrance = function() {
  return this.type=="entrance";
}

Installation.prototype.isProduct = function() {
  return this.type=="product";
}

Installation.prototype.isCashier = function() {
  return this.type=="cashier";
}

Installation.prototype.location_description = function () {
  var self = this;
  var location = Locations.findOne({ _id: self.locationId });
  var name, description;
  if (self.isEntrance()) {
    name = Entrances.findOne(({ _id: self.physicalId })).name;
    description = name + " @ " + location.name;
  } else if (self.isProduct()) {
    name = Products.findOne(({ _id: self.physicalId })).name;
    description = name + " @ " + location.name;
  } else if (self.isCashier()) {
    name = Cashiers.findOne(({ _id: self.physicalId })).name;
    description = name + " @ " + location.name;
  } else {
    description = location.name;
  }
  return description;
}

Installation.ensureIndex = function() {
  Installations._ensureIndex({locationId:1, type:1, physicalId:1})
}
