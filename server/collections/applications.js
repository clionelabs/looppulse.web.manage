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

Application.authenticatedResponse = function(applicationId, token, session) {
  var app = Applications.findOne({_id: applicationId});
  if (!app) {
    app = new UnauthenticatedApplication();
  }

  return app.authenticatedResponse(token, session);
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
};

Application.prototype.authenticatedResponse = function (token, sessionInfo) {
  var self = this;
  var response = {};
  try {
    var company = Companies.findOne({_id: self.companyId});
    response["system"] = company.authenticatedResponse();
    var sessionId = Sessions.create(
      self.companyId,
      sessionInfo.visitorUUID,
      sessionInfo.sdk,
      sessionInfo.device);
    response["session"] = sessionId;
    response["authenticated"] = true;
    response["statusCode"] = 200;
  } catch (e) {
    console.error("[Application] Authentication Error: ", e);
    response = {};
    response["authenticated"] = false;
    if (token != self.token) {
      response["statusCode"] = 401;
    } else {
      response["statusCode"] = 400;
    }
  }
  return response;
};

UnauthenticatedApplication = function() {
};
UnauthenticatedApplication.prototype.authenticatedResponse = function(token, sessionInfo) {
  var app = new Application();
  return app.authenticatedResponse(token, sessionInfo);
};


Token = {};
Token.create = function() {
  return Random.secret(20);
};
