/**
 *
 * @param visitorId
 * @param {Encounter} [encounter]
 * @returns {boolean}
 */
Segment.prototype.match = function (visitorId, encounter) {
  // TODO remove optional `encounter` from arguments, also visitor instance could be passed in as visitor instance was fetched during daily jobs
  var self = this;

  // Make sure visitor is the same company of segment
  if (!Visitors.findOne({ _id: visitorId, companyId: self.companyId})) {
    return false;
  }

  if (_.isEmpty(self.criteria)) {
    return true;
  }

  return new SegmentMatchCriteria(self.criteria).match(self.companyId, visitorId);
};
