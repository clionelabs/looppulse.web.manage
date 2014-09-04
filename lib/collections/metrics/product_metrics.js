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
      type: "product",
      physicalId: product._id,
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
 *
 * @param selector  - must have locationId, startTime.$gte, and startTime.$gte will truncated to hour
 */
ProductMetrics.findHourly = function(selector) {
  var locationId = selector.locationId;
  var startTime = selector.startTime.$gte;

  var location = Locations.find(locationId);
  return MetricsHelper.hourlyStartTimeSince(new Date(startTime)).map(function(startTime) {
    Products.find({companyId: location.companyId}).map(function(product) {
      var installationSelector = {
        type: "product",
        physicalId: product._id,
        locationId: locationId,
        resolution: "hourly",
        startTime: startTime
      };
      var doc = {
        locationId: locationId,
        visitCount: 0,
        dwellTime: 0,
        repeatedVisitCount: 0,
        startTime: startTime
      };
      InstallationMetrics.findHourly(installationSelector).map(function(installationMetric) {
        doc.visitCount += installationMetric.visitCount;
        doc.dwellTime += installationMetric.dwellTime;
        doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
      });

      return new ProductMetric(doc);
    });
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
