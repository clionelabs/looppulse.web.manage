Meteor.startup(function () {

  Accounts.config({
    forbidClientAccountCreation: true
  });

  Tracker.autorun(function () {
    console.log("userId changed" + Meteor.userId());
    var company = Companies.findOne({ "ownedByUserIds" : Meteor.userId() });
    if (company) {
      Session.makeAuth('currentCompanyId');
      Session.setAuth('currentCompanyId', company._id);
    } else {
      Session.clearAuth();
    }
  });

  Accounts.ui.config({ passwordSignupFields: 'EMAIL_ONLY' });

  AccountsEntry.config({
    homeRoute: '/sign-in',
    dashboardRoute: '/segments',
    language: 'en',
    showSignupCode: false
  });

});
