Products = new Meteor.Collection('products');

Product = function(name, company_id) {
  this.name = name;
  this.company_id = company_id;
}

Product.prototype.save = function() {
  Products.upsert(this, this);
  this._id = Products.findOne(this)._id;
  return this._id;
}
