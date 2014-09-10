Segments = new Meteor.Collection("segments", {
  transform: function(doc) {
    return new Segment(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property companyId
 * @property name
 * @property criteria
 */
Segment = function(doc) {
  _.extend(this, doc);
};

Segment.prototype.description = function() {
  return this.name;
};

Segment.prototype.match = function(visitor) {
  return _.any(this.rules, function(rule) {
    var segmentRule = SegmentRule.create(rule);
    return segmentRule.match(visitor);
  });
};

Segment.prototype.save = function() {
  var selector = {
    companyId: this.companyId,
    name: this.name
  };
  var modifier = {
    $set: {
    }
  };
  var result = Segments.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Segments.findOne(selector)._id;
  }
  return this._id;
};
