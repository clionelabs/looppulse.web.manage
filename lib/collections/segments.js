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
 */
Segment = function(doc) {
  _.extend(this, doc);
};

Segment.prototype.description = function() {
  return this.name;
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
