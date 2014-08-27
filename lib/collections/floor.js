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
 */
Floor = function(doc) {
  _.extend(this, doc);
};
