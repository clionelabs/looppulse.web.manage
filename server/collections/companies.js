Company.prototype.firebaseRef = function() {
  return this.systemConfig.firebase.root + "/companies/" + this._id.toString();
};

Company.prototype.generateBeaconEventsRef = function() {
  return this.firebaseRef() + "/beacon_events";
};

Company.prototype.generateEngagementEventsRef = function() {
  return this.firebaseRef() + "/engagement_events";
};

// This is a JSON returned after successfully authenticated
Company.prototype.authenticatedResponse = function() {
  var systemConfig = this.systemConfig;
  _.extend(systemConfig, {
    "configurationJSON": this.configurationJSON,
    "firebase": {
      "beacon_events": this.generateBeaconEventsRef(),
      "engagement_events": this.generateEngagementEventsRef()
    }
  });
  return systemConfig;
};
