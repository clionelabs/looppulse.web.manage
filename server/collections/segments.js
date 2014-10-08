/**
 *
 * @param visitorId
 * @param {Encounter} [encounter]
 * @returns {boolean}
 */
Segment.prototype.match = function (visitorId, encounter) {
  var self = this;

  // Make sure visitor has encounter of segment.companyId
  if (encounter) {
    if (!encounter.didHappenInCompany(self.companyId)) {
      return false;
    }
  } else if (!Encounters.findOneByCompany(self.companyId, { visitorId: visitorId })) {
    return false;
  }

  if (_.isEmpty(self.criteria)) {
    return true;
  }

  return new SegmentMatchCriteria(self.criteria).match(self.companyId, visitorId);
};
