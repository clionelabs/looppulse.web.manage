Companies = new Meteor.Collection('companies');

Company = function(name, logoUrl, firebaseId) {
  this.name = name;
  this.logoUrl = logoUrl;
  if (!firebaseId) {
    firebaseId = new Meteor.Collection.ObjectID;
    firebaseId = firebaseId.toHexString();
  }
  this.firebaseId = firebaseId;
}

Company.prototype.save = function() {
  Companies.upsert(this, this);
  this._id = Companies.findOne(this)._id;
  return this._id;
}
