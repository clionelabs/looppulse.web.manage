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

Application.authenticate = function(companyId, token) {
  return Applications.find({companyId: companyId, token: token}).count() > 0;
};

Token = {};
Token.create = function() {
  return Random.secret(20);
};
