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
 * @returns {IMeteorCursor|*}
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
