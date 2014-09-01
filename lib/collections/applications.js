Applications = new Meteor.Collection("applications", {
  transform: function(doc) {
    var obj = new Application(doc.companyId, doc.name, doc.token);
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
Application = function(companyId, name, token) {
  var self = this;
  self.companyId = companyId;
  self.name = name;
  if (token) {
    self.token = token;
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
