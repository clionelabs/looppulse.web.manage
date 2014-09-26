Visitors = new Meteor.Collection('visitors', {
  transform: function (doc) {
    // TODO refactor constructor to load from doc
    var obj = new Visitor(doc.uuid);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 * - has many {@link Encounter}
 * - has many {@link BeaconEvent}
 *
 * @param uuid
 * @constructor
 *
 * @property uuid
 * @property externalId
 */
Visitor = function(uuid) {
  this.uuid = uuid;
}

Visitor.prototype.save = function() {
  var selector = {
    uuid: this.uuid
  };
  var modifier = {
    $set: {
      externalId: this.externalId
    }
  };
  var result = Visitors.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Visitors.findOne(selector)._id;
  }
  return this._id;
}

Visitor.prototype.setExternalId = function(externalId) {
  this.externalId = externalId;
}

Visitor.ensureIndex = function() {
  Visitors._ensureIndex({uuid: 1});
}
