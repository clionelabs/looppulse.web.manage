CategoryMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector
 *
 */
CategoryMetrics.find = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  var categoryMetrics = [];
  var installationMetrics = Metrics.find(finalSelector);
  installationMetrics.forEach(function() {
    var categoryMetric = new CategoryMetric(doc);
    categoryMetrics.push();
  });
  return categoryMetrics
};

CategoryMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = CategoryMetric.type;
};

CategoryMetric.prototype = Object.create(BaseMetric.prototype);
CategoryMetric.prototype.constructor = CategoryMetric;

CategoryMetric.type = "category";
