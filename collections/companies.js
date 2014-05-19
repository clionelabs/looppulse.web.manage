Companies = new Meteor.Collection('companies');

Company = function(name, logo_url) {
  this.name = name;
  this.logo_url = logo_url;
}

Company.prototype.save = function() {
  Companies.upsert(this, this);
  this._id = Companies.findOne(this)._id;
  return this._id;
}
