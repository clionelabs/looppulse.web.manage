Applications = new Meteor.Collection("applications", {
  transform: function(doc) {
    var obj = new Application(doc);
    _.extend(obj, doc);
    return obj;
  }
});

/**
 *
 * @param companyId
 * @param name
 * @constructor
 *
 * @property companyId
 * @property name
 * @property token
 */
Application = function(doc) {
  var self = this;
  self.companyId = doc.companyId;
  self.name = doc.name;
  self._id = doc._id;
  if (doc.token) {
    self.token = doc.token;
  } else {
    self.token = Token.create();
  }
};

Application.authenticatedResponse = function(applicationId, token) {
  var app = Applications.findOne({_id: applicationId});
  if (!app) {
    app = new UnauthenticatedApplication();
  }

  return app.authenticatedResponse(token);
};

Application.prototype.save = function() {
  var self = this;
  var selector = {
    name: self.name,
    companyId: self.companyId
  };
  if (self._id) {
    selector._id = self._id;
  }
  var modifier = {
    $set: {
      token: self.token
    }
  };
  var result = Applications.upsert(selector, modifier);
  if (result.insertedId) {
    self._id = result.insertedId;
  } else {
    self._id = Applications.findOne(selector)._id;
  }
  return self._id;
}

Application.prototype.authenticatedResponse = function(token) {
  self = this;
  var response = {};
  if (token != self.token) {
    response["authenticated"] = false;
    response["statusCode"] = 401;
  } else {
    response["authenticated"] = true;
    response["statusCode"] = 200;

    // TODO: read these from company settings
    var company = Companies.findOne({_id: self.companyId});
    response["system"] = company.authenticatedResponse();
  }
  return response;
}

UnauthenticatedApplication = function () {};
UnauthenticatedApplication.prototype.authenticatedResponse = function(token) {
  var app = new Application();
  return app.authenticatedResponse(token);
};


Token = {};
Token.create = function() {
  return Random.secret(20);
};
