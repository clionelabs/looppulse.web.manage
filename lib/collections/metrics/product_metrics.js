ProductMetrics = {};

ProductMetrics.findInLocation = function(selector) {
  var locationId = selector.locationId;

  var location = Locations.find(locationId);
  return Products.find({companyId: location.companyId}).map(function(product) {
    var doc = {
      type: ProductMetric.type,
      productId: product._id,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0
    };

    var installationIds = product.installations().map(function(installation) {
      return installation._id;
    });

    InstallationMetrics.findDaily({
      locationId: locationId,
      installationId: { $in: installationIds }
    }).map(function(installationMetric) {
      doc.visitCount += installationMetric.visitCount;
      doc.dwellTime += installationMetric.dwellTime;
      doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
    });

    return new ProductMetric(doc);
  });
};

/**
 * - belongs to a {@link Installation}
 *
 * @param doc
 * @constructor
 *
 * @property _id
 * @property type
 * @property productId
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 *
 */
ProductMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = ProductMetric.type;
};

ProductMetric.prototype = Object.create(BaseMetric.prototype);
ProductMetric.prototype.constructor = ProductMetric;

ProductMetric.type = "product";
