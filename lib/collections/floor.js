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
 * @property name
 * @property level
 */
Floor = function(doc) {
  _.extend(this, doc);
};
