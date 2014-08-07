Installations = new Meteor.Collection('installations');

Installation = function(type, locationId, beaconId, physicalId, name, coord) {
  this.type = type;
  this.locationId = locationId;
  this.beaconId = beaconId;
  this.physicalId = physicalId;
  this.name = name;
  this.coord = coord
}

Installation.prototype.save = function() {
  Installations.upsert(this, this);
  this._id = Installations.findOne(this)._id;
  return this._id;
}

Installation.load = function(attributes) {
  var json = Installations.findOne(attributes);
  var loaded = new Installation(json.type, json.locationId, json.beaconId, json.physicalId, json.name, json.coord);
  loaded._id = json._id;
  return loaded;
}

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
