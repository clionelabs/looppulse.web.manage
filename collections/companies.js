Companies = new Meteor.Collection('companies');

Company = function(name, logoUrl) {
  this.name = name;
  this.logoUrl = logoUrl;
}

Company.prototype.save = function() {
  Companies.upsert(this, this);
  this._id = Companies.findOne(this)._id;
  return this._id;
}
