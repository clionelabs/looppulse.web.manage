Meteor.startup(function () {

  Accounts.config({
    forbidClientAccountCreation: true
  });

  Accounts.ui.config({ passwordSignupFields: 'EMAIL_ONLY' });

  AccountsEntry.config({
    homeRoute: '/',
    dashboardRoute: '/segments',
    language: 'en',
    showSignupCode: false
  });

});
