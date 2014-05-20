Products = new Meteor.Collection('products');

Product = function(name, location_id) {
  this.name = name;
  this.location_id = location_id;
}

Product.prototype.save = function() {
  Products.upsert(this, this);
  this._id = Products.findOne(this)._id;
  return this._id;
}
