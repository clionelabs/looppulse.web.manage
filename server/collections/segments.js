/**
 *
 * @param visitorId
 * @param {Encounter} [encounter]
 * @returns {boolean}
 */
Segment.prototype.match = function(visitorId, encounter) {
  var companyId = this.companyId;
  var criteria = this.criteria;

  // Make sure visitor has encounter of segment.companyId
  if (encounter && !encounter.didHappenInCompany(companyId)) {
    return false;
  } else if (!Encounters.findOneByCompany(companyId, { visitorId: visitorId })) {
    return false;
  }

  if (!criteria) {
    return true;
  }

  return new SegmentMatchCriteria(criteria).match(companyId, visitorId);
};
