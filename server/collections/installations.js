// beacon, coordinate, product
Installation.prototype.denormalizedJSON = function () {
  var json = {};
  json["product"] = Products.findOne({_id: this.productId}).name;
  json["coordinate"] = this.coord;

  var beaconJSON = {};
  var beacon = Beacons.findOne({_id: this.beaconId});
  beaconJSON["proximityUUID"] = beacon.uuid;
  beaconJSON["major"] = beacon.major;
  beaconJSON["minor"] = beacon.minor;
  json["beacon"] = beaconJSON;

  return json;
};

Installation.ensureIndex = function () {
  Installations._ensureIndex({
    beaconId: 1,
    locationId: 1,
    productId: 1,
    'coord.z': 1
  });
};
