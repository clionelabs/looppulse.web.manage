FloorMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector
 * @returns {IMeteorCursor|*}
 *
 */
FloorMetrics.find = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector, {
    transform: function(doc) {
      return new FloorMetric(doc);
    }
  });
};

FloorMetric = function(doc) {
  BaseMetric.call(this, doc);
};
