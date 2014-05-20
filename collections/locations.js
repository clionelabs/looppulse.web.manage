Locations = new Meteor.Collection('locations');

Location = function(name, address, company_id) {
  this.name = name;
  this.address = address;
  this.company_id = company_id;
}

Location.prototype.save = function() {
  Locations.upsert(this, this);
  this._id = Locations.findOne(this)._id;
  return this._id;
}
