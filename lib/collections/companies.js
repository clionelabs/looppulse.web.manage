Companies = new Meteor.Collection('companies', {
  transform: function(doc) {
    var obj = new Company(doc.name, doc.systemConfig, doc.configurationJSON);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 * - has many {@link Location}
 * - has many {@link Product}
 *
 * @param {string} name
 * @param {hash} systemConfig
 * @param {string} configurationJSON
 * @constructor
 *
 * @property {string} name
 * @property {hash} systemConfig
 * @property {string} configurationJSON
 */
Company = function(name, systemConfig, configurationJSON) {
  this.name = name;
  this.systemConfig = systemConfig;
  this.configurationJSON = configurationJSON;
}

Company.prototype.save = function() {
  var selector = {
    name: this.name
  };
  var modifier = {
    $set: {
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
}

Company.prototype.firebaseRef = function () {
  return this.systemConfig.firebase.root+"/companies/"+this._id.toString();
}

Company.prototype.generateBeaconEventsRef = function () {
  return this.firebaseRef()+"/beacon_events";
}

Company.prototype.generateEngagementEventsRef = function () {
  return this.firebaseRef()+"/engagement_events";
}

// This is a JSON returned after successfully authenticated
Company.prototype.authenticatedResponse = function () {
  var systemConfig = this.systemConfig;
  _.extend(systemConfig,
           { "configurationJSON": this.configurationJSON,
             "firebase":
              {"beacon_events": this.generateBeaconEventsRef(),
               "engagement_events": this.generateEngagementEventsRef()}
           });
  return systemConfig;
}
