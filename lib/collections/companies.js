Companies = new Meteor.Collection('companies');

/**
 * - has many {@link Location}
 * - has many {@link Product}
 *
 * @param {string} name
 * @param {string} logoUrl
 * @constructor
 *
 * @property {string} name
 * @property {string} logoUrl
 */
Company = function(name, logoUrl) {
  this.name = name;
  this.logoUrl = logoUrl;
}

Company.prototype.save = function() {
  Companies.upsert(this, this);
  this._id = Companies.findOne(this)._id;
  return this._id;
}
