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

Application.authenicatedResponse = function(applicationId, token) {
  var app = Applications.findOne({_id: applicationId});
  if (!app) {
    app = new UnauthenicatedApplication();
  }

  return app.authenicatedResponse(token);
};

Application.prototype.authenicatedResponse = function(token) {
  self = this;
  var response = {};
  if (token != self.token) {
    response["authenicated"] = false;
    response["statusCode"] = 401;
  } else {
    response["authenicated"] = true;
    response["statusCode"] = 200;

    // TODO: read these from company settings
    response["onlySendBeaconEventsWithKnownProximity"] = false;
    response["configurationURL"] = "https://looppulse-config-thomas.firebaseio.com/companies/-JUw0gTrsmeSBsbqeGif.json";
    var parseConfig = {};
    parseConfig["applicationId"] = Meteor.settings.parse.applicationId;
    parseConfig["clientKey"] = "hnz5gkWZ45cJkXf8yp2huHc89NG55O1ajjHSrwxh";
    response["parse"] = parseConfig;
  }
  return response;
}

UnauthenicatedApplication = function () {};
UnauthenicatedApplication.prototype.authenicatedResponse = function(token) {
  var app = new Application();
  return app.authenicatedResponse(token);
};


Token = {};
Token.create = function() {
  return Random.secret(20);
};
