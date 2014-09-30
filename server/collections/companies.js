Company.prototype.firebaseRef = function() {
  return this.systemConfig.firebase.root + "/companies/" + this._id.toString();
};

Company.prototype.generateBeaconEventsRef = function() {
  return this.firebaseRef() + "/beacon_events";
};

Company.prototype.generateEngagementEventsRef = function() {
  return this.firebaseRef() + "/engagement_events";
};

Company.prototype.generateVisitorEventsRef = function() {
  return this.firebaseRef() + "/visitor_events";
}

// This is a JSON returned after successfully authenticated
Company.prototype.authenticatedResponse = function() {
  var systemConfig = this.systemConfig;
  var tokenGenerator = new FirebaseTokenGenerator(systemConfig.firebase.rootSecret);
  var token = tokenGenerator.createToken(
    {companyId: this._id},
    {admin: true}  // FIXME config Firebase security role per company
  );
  _.extend(systemConfig, {
    "configurationJSON": this.configurationJSON,
    "firebase": {
      "token": token,
      "beacon_events": this.generateBeaconEventsRef(),
      "engagement_events": this.generateEngagementEventsRef(),
      "visitor_events": this.generateVisitorEventsRef()
    }
  });
  return systemConfig;
};
