SegmentRule = function(rawRule) {
  this.rawRule = rawRule;
};

SegmentRule.create = function(rawRule) {
  if (rawRule === "visitors") {
    return new AllVisitorSegmentRule(rawRule);
  }
};

AllVisitorSegmentRule = function(rawRule) {
  SegmentRule.call(this, rawRule);
};

AllVisitorSegmentRule.prototype = Object.create(SegmentRule.prototype);
AllVisitorSegmentRule.prototype.constructor = AllVisitorSegmentRule;

AllVisitorSegmentRule.prototype.match = function(visitor) {
  return !!visitor;
};
