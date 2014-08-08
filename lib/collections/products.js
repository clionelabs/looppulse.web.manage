Products = new Meteor.Collection('products');

/**
 * - belongs to a {@link Company}
 * - has many {@link Installation}
 *
 * @param name
 * @param companyId
 * @constructor
 *
 * @property name
 * @property companyId
 */
Product = function(name, companyId) {
  this.name = name;
  this.companyId = companyId;
}

Product.prototype.save = function() {
  Products.upsert(this, this);
  this._id = Products.findOne(this)._id;
  return this._id;
}
