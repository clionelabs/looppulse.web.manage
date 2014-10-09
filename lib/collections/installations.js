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
 * @param locationId
 * @param beaconId
 * @param productId
 * @param name
 * @param coord
 * @constructor
 *
 * @property locationId
 * @property beaconId
 * @property productId
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

Installation.prototype.locationDescription = function() {
  var location = Locations.findOne(this.locationId);
  var product = Products.findOne(this.productId);
  return product.name + " @ " + location.name;
};
