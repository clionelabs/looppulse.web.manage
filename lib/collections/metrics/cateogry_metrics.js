CategoryMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector
 * @returns CategoryMetric[]
 *
 */
CategoryMetrics.find = function(selector) {
  var locationId = selector.locationId;
  var categoryMetrics = [];

  Categories.find().forEach(function(category) {
    var doc = {
      categoryId: category._id,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0
    };

    var installationIds = [];
    // TODO remove `type` from selector since Installation.type are now in Product
    Installations.find({ locationId: locationId, type: "product" }).forEach(function(installation) {
      var product = Products.findOne(installation.physicalId);
      if (product.categoryId === category._id) {
        installationIds.push(installation._id);
      }
    });

    var installationSelector = {
      locationId: locationId,
      installationIds: { $in: installationIds }
    };
    InstallationMetrics.find(installationSelector).forEach(function(installationMetric) {
      doc.visitCount += installationMetric.visitCount;
      doc.dwellTime += installationMetric.dwellTime;
      doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
    });

    categoryMetrics.push(new CategoryMetric(doc));
  });

  return categoryMetrics;
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
