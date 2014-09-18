CategoryMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector  - must filter by locationId
 *
 */
CategoryMetrics.find = function(selector) {
  var locationId = selector.locationId;

  return Categories.find().map(function(category) {
    var doc = {
      categoryId: category._id,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0
    };

    var productIds = category.products().map(function(product) {
      return product._id;
    });
    var installationIds = Installations.find({
      locationId: locationId,
      productId: { $in: productIds }
    }).forEach(function(installation) {
      return installation._id;
    });

    InstallationMetrics.find({
      locationId: locationId,
      installationId: { $in: installationIds }
    }).map(function(installationMetric) {
      doc.visitCount += installationMetric.visitCount;
      doc.dwellTime += installationMetric.dwellTime;
      doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
    });

    return new CategoryMetric(doc);
  });
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property categoryId
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 */
CategoryMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = CategoryMetric.type;
};

CategoryMetric.prototype = Object.create(BaseMetric.prototype);
CategoryMetric.prototype.constructor = CategoryMetric;

CategoryMetric.type = "category";
