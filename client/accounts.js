Meteor.startup(function(){
  Accounts.ui.config({passwordSignupFields: 'EMAIL_ONLY'})
  console.log(Accounts)

  AccountsEntry.config({
    homeRoute: '/',
    dashboardRoute: '/dashboard',
    language: 'en',
    showSignupCode: false

  })

  Accounts.config({
    forbidClientAccountCreation: true
  })
});
