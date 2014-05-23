Products = new Meteor.Collection('products');

Product = function(name, companyId) {
  this.name = name;
  this.companyId = ccompanyId
}

Product.prototype.save = function() {
  Products.upsert(this, this);
  this._id = Products.findOne(this)._id;
  return this._id;
}
