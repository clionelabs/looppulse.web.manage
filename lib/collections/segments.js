Segments = new Meteor.Collection("segments", {
  transform: function (doc) {
               return new Segment(doc);
             }
});

Segments.findScheduled = function () {
  return Segments.find({ "criteria.hasBeen": false });
};

/**
 * Return the default segment which contains every visitor.
 *
 * @return {Segment} Default Every-Visitor-Segments
 */
Segments.findEveryVisitorSegment = function(companyId) {
  return Segments.findOne({companyId: companyId, criteria: {}})
}

Segments.findByCompany = function(companyId, selector) {
  if (!selector) selector = {};
  _.extend(selector, {companyId: companyId});
  return Segments.find(selector);
}

/**
 *
 * @param doc
 * @constructor
 *
 * @property companyId
 * @property name
 * @property criteria
 * @property createdAt
 */
Segment = function (doc) {
  _.extend(this, doc);
};

Segment.prototype.save = function () {
  var self = this;
  var selector = self._id || {
    companyId: self.companyId,
      name: self.name
  };
  var modifier = {
    $set: {
      criteria: self.criteria,
    },
    $setOnInsert: {
      companyId: self.companyId,
      name: self.name,
      createdAt: lodash.now()
    }
  };
  var result = Segments.upsert(selector, modifier);
  if (result.insertedId) {
    self._id = result.insertedId;
  } else {
    self._id = Segments.findOne(selector)._id;
  }
  return self._id;
};

/**
 * Check whether it is the built-in Every Visitor Segment.
 */
Segment.prototype.isEveryVisitor = function() {
  return Object.keys(this.criteria).length === 0;
}
