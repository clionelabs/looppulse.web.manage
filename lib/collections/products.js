Products = new Meteor.Collection('products', {
  transform: function(doc) {
    return new Product(doc);
  }
});

/**
 *
 * @param locationId
 * @returns {Meteor.Collection.Cursor}
 */
Products.findInLocation = function(locationId) {
  var productIds = Installations.find({locationId: locationId}).map(function(installation) {
    return installation.productId;
  });
  return Products.find({_id: {$in: productIds}});
};

/**
 * - belongs to a {@link Company}
 * - belongs to a {@link Category}
 * - has many {@link Installation}
 *
 * @param doc
 * @constructor
 *
 * @property name
 * @property companyId
 * @property categoryId
 */
Product = function(doc) {
  _.extend(this, doc);
};

/**
 *
 * @returns {Meteor.Collection.Cursor}
 */
Product.prototype.installations = function() {
  return Installations.find({
    type: "product",
    physicalId: this._id
  });
};

Product.prototype.save = function() {
  var selector = {
    companyId: this.companyId,
    name: this.name
  };
  var modifier = {
    $set: {
      categoryId: this.categoryId
    }
  };
  var result = Products.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Products.findOne(selector)._id;
  }
  return this._id;
};
