Visitors = new Meteor.Collection('visitors', {
  transform: function (doc) {
    return new Visitor(doc);
  }
});

/**
 * - has many {@link Encounter}
 * - has many {@link BeaconEvent}
 *
 * @param doc
 * @param doc.companyId
 * @param doc.uuid
 * @param [doc._id]
 * @param [doc.externalId]
 * @constructor
 *
 * @property companyId
 * @property uuid
 * @property externalId
 */
Visitor = function (doc) {
  _.extend(this, doc);
};

Visitor.prototype.save = function () {
  var self = this;
  var selector = {
    companyId: self.companyId,
    uuid: self.uuid
  };
  var modifier = {
    $set: {
      externalId: self.externalId
    },
    $setOnInsert: {
      companyId: self.companyId,
      uuid: self.uuid
    }
  };
  var result = Visitors.upsert(selector, modifier);
  if (result.insertedId) {
    self._id = result.insertedId;
  } else {
    self._id = Visitors.findOne(selector)._id;
  }
  return self._id;
};

Visitor.ensureIndex = function () {
  Visitors._ensureIndex({ companyId: 1, uuid: 1 });
};
