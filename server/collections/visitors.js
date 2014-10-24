/*
 *  Return the segment Id list, in which this visitor belongs, at a particular time
 *
 *  @param at Time at which you are checking
 *  @return Array of segment id
 */
Visitor.prototype.getSegmentIdList = function(at) {
  var outIds = {};
  var inIds = {};
  SegmentVisitorFlows.find({visitorId: this._id, time: {$lte: at}}, {sort: {time: -1}}).forEach(function(flow) {
    if (outIds[flow.segmentId] !== undefined) return; // since we sort in desc order, if an out event appeared before, everything else is irrelevant
    if (flow.delta === 1) inIds[flow.segmentId] = true;
    else outIds[flow.segmentId] = true;
  });
  return Object.keys(inIds);
}

/**
 *
 * @param selector
 * @param selector.companyId
 * @param selector.uuid
 * @returns {Visitor}
 */
Visitors.findOneOrCreate = function (selector) {
  Visitors.upsert(selector, { $setOnInsert: selector });
  return Visitors.findOne(selector);
};

Visitors.identifyUser = function (companyId, uuid, externalId) {
  var selector = {
    companyId: companyId,
    uuid: uuid
  };
  Visitors.upsert(selector, {
    $set: { externalId: externalId },
    $setOnInsert: selector
  });
};

Visitor.ensureIndex = function () {
  Visitors._ensureIndex({ companyId: 1, uuid: 1 });
};

Visitors.tagUser = function (companyId, uuid, properties) {
  var selector = {
    companyId: companyId,
    uuid: uuid
  };
  Visitors.upsert(selector, {
    $set: { properties: properties },
    $setOnInsert: selector
  });
};
