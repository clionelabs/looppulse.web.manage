Meteor.startup(function(){
  var cfg = null;
  console.info("Config on Server side")
  if(Meteor.settings && Meteor.settings.accounts) {
    cfg = {};
  } else {
    console.info("[Init] No user accounts setting found. skip.")
    return;
  }

  // User Account Config
  cfg.forbidClientAccountCreation = Meteor.settings.accounts.forbidClientAccountCreation || false;
  Accounts.config(cfg)

  initAccounts(Meteor.settings.accounts.admin)

});

var initAccounts = function(settings){
  if (!settings || !settings.login) { return false; }
  // Admin Account Config
  var _userId = "";
  var _phrase = "";
  var _login = Meteor.settings.accounts.admin.login
  var _user = Meteor.users.findOne({ emails: { $elemMatch: { address:  _login } } })

  if (_user && Roles.userIsInRole(_user, ['admin'])) {
    console.info("[Init] Already have admin user, good to go.", _user)
    return false;
  }

  if (!_user){
    console.info("[Init] Admin not found. Creating Account...")
    // Set initial password or random string (when passphrase is null)
    // If random string is set in config, showInfoAfterCreation or mailInfoAfterCreation must have either one to be true
    _phrase = Meteor.settings.accounts.admin.passphrase || Math.random().toString(36).slice(-8);
    _userId = Accounts.createUser({
      'email': _login,
      'password': _phrase
    });
    if (Meteor.settings.accounts.admin.showInfoAfterCreation) {
      console.info("[Init] New admin created:", _login, _phrase)
    }
    if (Meteor.settings.accounts.admin.mailInfoAfterCreation) {
      Accounts.sendEnrollmentEmail(_userId)
    }
  }

  console.info("[Init] Adding Admin Role")
  if (_user) {
    Roles.addUsersToRoles(_user, ['admin']);
  } else if(_userId) {
    Roles.addUsersToRoles(_userId, ['admin']);
  }
  _login = null
  _phrase = null

}