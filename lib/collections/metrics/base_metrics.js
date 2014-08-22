/**
 *
 * @param doc
 * @constructor
 */
BaseMetric = function(doc) {
  _.extend(this, doc);
};

BaseMetric.calculateConversionRate = function(totalCount, convertedCount) {
  return convertedCount * 100 / totalCount;
};
