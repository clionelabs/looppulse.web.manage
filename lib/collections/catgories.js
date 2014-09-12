Categories = new Meteor.Collection('categories', {
  transform: function(doc) {
    return new Category(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property companyId
 * @property name
 */
Category = function(doc) {
  _.extend(this, doc);
};

/**
 *
 * @returns {Meteor.Collection.Cursor}
 */
Category.prototype.installations = function() {
  var productIds = this.products().map(function(product) {
    return product._id;
  });
  var locationIds = Locations.find({companyId: this.companyId}).map(function(location) {
    return location._id;
  });
  // TODO remove `type` from selector since Installation.type are now in Product
  return Installations.find({
    locationId: { $in: locationIds },
    type: "product",
    physicalId: { $in: productIds }
  });
};

/**
 *
 * @returns {Meteor.Collection.Cursor}
 */
Category.prototype.products = function() {
  return Products.find({
    categoryId: this.categoryId
  });
};

Category.prototype.save = function() {
  var selector = {
    companyId: this.companyId,
    name: this.name
  };
  var modifier = {
    $set: {
    }
  };
  var result = Categories.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Categories.findOne(selector)._id;
  }
  return this._id;
};
