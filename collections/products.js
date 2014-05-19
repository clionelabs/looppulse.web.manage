Products = new Meteor.Collection('products');

Product = function(name) {
  this.name = name;
}

Product.prototype.save = function() {
  Products.upsert(this, this);
  this._id = Products.findOne(this)._id;
  return this._id;
}
