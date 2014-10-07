Companies = new Meteor.Collection('companies', {
  transform: function(doc) {
    var obj = new Company(doc.name, doc.systemConfig, doc.configurationJSON, doc.ownedByUserIds);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 * - has many {@link Location}
 * - has many {@link Product}
 * - has one {@link User}
 *
 * @param {string} name
 * @param {hash} systemConfig
 * @param {string} configurationJSON
 * @constructor
 *
 * @property {string} name
 * @property {hash} systemConfig
 * @property {string} configurationJSON
 * @property {hash} ownedByUserIds
 */
Company = function(name, systemConfig, configurationJSON, ownedByUserIds) {
  this.name = name;
  this.systemConfig = systemConfig;
  this.configurationJSON = configurationJSON;
  //Probably later will become a list of userId, until multiple user
  this.ownedByUserIds = ownedByUserIds;
};

Company.prototype.save = function() {
  var selector = {
    name: this.name
  };
  var modifier = {
    $set: {
      ownedByUserIds: this.ownedByUserIds,
      systemConfig: this.systemConfig,
      configurationJSON: this.configurationJSON
    }
  };
  var result = Companies.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Companies.findOne(selector)._id;
  }
  return this._id;
};

