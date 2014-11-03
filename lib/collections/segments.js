Segments = new Meteor.Collection("segments", {
  transform: function (doc) {
               return new Segment(doc);
             }
});

Segments.findScheduled = function () {
  return Segments.find({ "criteria.hasBeen": false });
};

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

