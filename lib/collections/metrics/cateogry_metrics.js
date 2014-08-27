CategoryMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector
 *
 */
CategoryMetrics.find = function(selector) {
  // FIXME replace dummyData with real implementation
  if (Categories.find().count() === 0) {
    Companies.find().forEach(function(company) {
      var dummyCategory = new Category({
        companyId: company._id,
        name: "Dummy Category"
      });
      dummyCategory.save();
    });
  }

  var dummyData = [];
  Categories.find().forEach(function(category) {
    dummyData.push(new CategoryMetric({
      categoryId: category._id
    }));
  });
  return dummyData;
};

CategoryMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = CategoryMetric.type;
};

CategoryMetric.prototype = Object.create(BaseMetric.prototype);
CategoryMetric.prototype.constructor = CategoryMetric;

CategoryMetric.type = "category";
