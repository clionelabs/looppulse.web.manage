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
