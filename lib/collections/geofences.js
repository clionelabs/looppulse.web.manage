Geofences = new Meteor.Collection('geofences', {
  transform: function(doc) {
    return new Geofence(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property geofenceKey 
 * @property companyId
 * @property latitude
 * @property longitude
 * @property radius 
 */
Geofence = function(doc) {
  _.extend(this, doc);
};

Geofence.prototype.save = function() {
  var selector = {
    companyId: this.companyId, 
    geofenceKey: this.geofenceKey
  };
  var modifier = {
    $setOnInsert: {
      companyId: this.companyId,
      geofenceKey: this.geofenceKey,
      latitude: this.latitude,
      longitude: this.longitude,
      radius: this.radius
    }
  };
  var result = Geofences.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Geofences.findOne(selector)._id;
  }
  return this._id;
};
