Cashiers = new Meteor.Collection('cashiers');

/**
 * - belongs to a {@link Location}
 *
 * @param name
 * @constructor
 *
 * @property name
 */
Cashier = function(name) {
  this.name = name;
}

Cashier.prototype.save = function() {
  Cashiers.upsert(this, this);
  this._id = Cashiers.findOne(this)._id;
  return this._id;
}
