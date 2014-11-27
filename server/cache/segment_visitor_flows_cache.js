/*
 * SegmentVisitorFlowsCache provides an in-memory cache of SegmentVisitorFlows, grouped by visitor/segment. i.e. data contains information of the following structure:
 * segmentFlows = {
 *   segment1: [flow11, flow12, ...],
 *   segment2: [flow21, flow22, ...],
 *   ....
 * }
 *
 * visitorFlows = {
 *   visitor1: [flow11, flow12, ...],
 *   visitor2: [flow21, flow22, ...],
 * }
 *
 * The purpose is to support efficient fetching on segment visitor flows. Due to the big overhead on Meteor Collections, fetching a lot of documents in
 * a collection is very slow. e.g. 10000 records take already around 1 second...
 */
SegmentVisitorFlowsCache = {
  segmentFlows: {},
  visitorFLows: {}
}

/*
 * Insert flow into cache
 * @param {SegmentVisitorFlow} flow
 */
SegmentVisitorFlowsCache.insertFlow = function(flow) {
  if (SegmentVisitorFlowsCache.segmentFlows[flow.segmentId] === undefined) SegmentVisitorFlowsCache.segmentFlows[flow.segmentId] = [];
  if (SegmentVisitorFlowsCache.visitorFLows[flow.visitorId] === undefined) SegmentVisitorFlowsCache.visitorFLows[flow.visitorId] = [];
  SegmentVisitorFlowsCache._insertFlow(SegmentVisitorFlowsCache.segmentFlows[flow.segmentId], flow);
  SegmentVisitorFlowsCache._insertFlow(SegmentVisitorFlowsCache.visitorFLows[flow.visitorId], flow);
}

/*
 * Remove flow from cache
 * @param {SegmentVisitorFlow} flow
 */
SegmentVisitorFlowsCache.removeFlow = function(flow) {
  if (SegmentVisitorFlowsCache.segmentFlows[flow.segmentId] !== undefined) {
      SegmentVisitorFlowsCache._removeFlow(SegmentVisitorFlowsCache.segmentFlows[flow.segmentId], flow); 
  }
  if (SegmentVisitorFlowsCache.visitorFLows[flow.visitorId] !== undefined) {
      SegmentVisitorFlowsCache._removeFlow(SegmentVisitorFlowsCache.visitorFLows[flow.visitorId], flow);
  }
}

/*
 * Get all flows happened before a particular time of a segment
 *
 * @param {Number} segmentId
 * @param {Unix Timestamp} before
 */
SegmentVisitorFlowsCache.getSegmentFlows = function(segmentId, before) {
  return SegmentVisitorFlowsCache._getFlows(SegmentVisitorFlowsCache.segmentFlows[segmentId], before);
}

/*
 * Get all flows happened before a particular time of a visitor
 *
 * @param {Number} visitorIdd
 * @param {Unix Timestamp} before
 */
SegmentVisitorFlowsCache.getVisitorFlows = function(visitorId, before) {
  return SegmentVisitorFlowsCache._getFlows(SegmentVisitorFlowsCache.visitorFLows[visitorId], before);
}

/*
 * @private
 */
SegmentVisitorFlowsCache._getFlows = function(flows, before) {
  if (flows === undefined) return []
  var result = [];
  for (var i = 0; i < flows.length; i++) {
    if (flows[i].deltaAt >= before) break;
    result.push(flows[i]);
  }
  return result;
}

/*
 * This method has a theoreitcal performance of O(N). However, insert normally happens in order,
 * so looping from the end could achieve a performance close to O(1)
 *
 * @private
 */
SegmentVisitorFlowsCache._insertFlow = function(flows, flow) {
  var index = flows.length; 
  while (index > 0 && flows[index-1].deltaAt > flow.deltaAt) {
    index--;
  }
  for (var i = flows.length-1; i >= index; i--) {
    flows[i+1] = flows[i];
  }
  flows[index] = flow;
}

/*
 * This method has a theoreitcal performance of O(N). However, insert normally happens in order,
 * so looping from the end could achieve a performance close to O(1)
 *
 * @private
 */
SegmentVisitorFlowsCache._removeFlow = function(flows, flow) {
  var index = flows.length - 1;
  while (index >= 0) {
    if (flows[index].deltaAt < flow.deltaAt) {
        index = -1;
        break;
    }
    if (flows[index].deltaAt == flow.deltaAt) {
        break;
    }
    index--;
  }
  if (index === -1) { 
      // Normallly, remove happens after it being inserted, so it should existed.
      console.warn("[SegmentVisitorFlowsCache] couldn't find the correct flow to remove."); 
      return;
  }
}

/**
 * Meteor Startup routine - observe SegmentVisitorFlows, and put them in cache
 */
SegmentVisitorFlowsCache.startup = function () {
  SegmentVisitorFlows.find().observe({
    "added": function(flow) {SegmentVisitorFlowsCache.insertFlow(flow)},
    "removed": function(flow) {SegmentVisitorFlowsCache.removeFlow(flow)},
  });
  console.info("[SegmentVisitorFlowsCache] startup complete");
};
