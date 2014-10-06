Visitors = new Meteor.Collection('visitors', {
  transform: function (doc) {
    return new Visitor(doc);
  }
});

Visitors.identifyUser = function (uuid, externalId) {
  Visitors.upsert({ uuid: uuid }, {
    $set: {
      externalId: externalId
    }
  });
};

/**
 * - has many {@link Encounter}
 * - has many {@link BeaconEvent}
 *
 * @param doc
 * @constructor
 *
 * @property uuid
 * @property externalId
 */
Visitor = function (doc) {
  _.extend(this, doc);
};

Visitor.prototype.save = function () {
  var self = this;
  var selector = self._id || {
    uuid: self.uuid
  };
  var modifier = {
    $set: {
      externalId: self.externalId
    },
    $setOnInsert: {
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
  Visitors._ensureIndex({uuid: 1});
};
