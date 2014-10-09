Sessions = new Meteor.Collection("sessions", {
  transform: function(doc) {
    var obj = new Session(doc);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 *
 * @param doc
 * @param doc.visitorId
 * @param doc.sdk
 * @param doc.device
 * @param [doc._id]
 * @constructor
 *
 * @property visitorId
 * @property sdk
 * @property device
 * @property createdAt
 */
Session = function(doc) {
  this.visitorId = doc.visitorId;
  this.sdk = doc.sdk;
  this.device = doc.device;
  this._id = doc._id;
};

Session.prototype.save = function() {
  var selector = {
    visitorId: this.visitorId,
    sdk: this.sdk,
    device: this.device
  };

  var modifier = {
    $setOnInsert: _.extend({}, selector, { createdAt: (new Date()).getTime() })
  };

  var result = Sessions.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Sessions.findOne(selector)._id;
  }
  return this._id;
}

// No findOrCreate beaause a new session creation is always expected
Sessions.create = function(companyId, visitorUUID, sdk, device) {
  var visitor = Visitors.findOneOrCreate({
    companyId: companyId,
    uuid: visitorUUID
  });
  var session = new Session({visitorId: visitor._id,
                             sdk: sdk,
                             device: device});
  return session.save();
}
