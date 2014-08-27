Companies = new Meteor.Collection('companies', {
  transform: function(doc) {
    return new Company(doc);
  }
});

/**
 * - has many {@link Location}
 * - has many {@link Product}
 *
 * @param {string} name
 * @param {string} logoUrl
 * @param {string} configurationJSON
 * @constructor
 *
 * @property {string} name
 * @property {string} logoUrl
 * @property {string} configurationJSON
 */
Company = function(name, logoUrl, configurationJSON) {
  this.name = name;
  this.logoUrl = logoUrl;
  this.configurationJSON = configurationJSON;
}

Company.prototype.save = function() {
  Companies.upsert(this, this);
  this._id = Companies.findOne(this)._id;
  return this._id;
}
