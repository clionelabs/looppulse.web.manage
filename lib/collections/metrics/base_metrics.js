/**
 *
 * @param doc
 * @constructor
 */
BaseMetric = function(doc) {
  _.extend(this, doc);
};

BaseMetric.calculateConversionRate = function(totalCount, convertedCount) {
  return BaseMetric.calculatePercentage(convertedCount, totalCount);
};

BaseMetric.calculatePercentage = function(n, total) {
  if (total === 0) {
    return 0;
  }
  return Math.round(n * 100 / total);
};
