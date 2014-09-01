Floors = new Meteor.Collection("floors", {
  transform: function(doc) {
    return new Floor(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property locationId
 * @property level
 * @property name
 */
Floor = function(doc) {
  _.extend(this, doc);
};

/**
 *
 * @returns {Meteor.Collection.Cursor}
 */
Floor.prototype.installations = function() {
  return Installations.find({
    "coord.z": this.level
  });
};

Floor.prototype.save = function() {
  var selector = {
    locationId: this.locationId,
    level: this.level
  };
  var modifier = {
    $set: {
      name: this.name
    }
  };
  var result = Floors.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Floors.findOne(selector)._id;
  }
  return this._id;
};
