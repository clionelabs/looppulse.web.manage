//helper functions for both client and server?

AccountsHelper = {};
AccountsHelper.signInAsAdmin = function(router, pause){
  return AccountsEntry.signInRequired(router, pause, Roles.userIsInRole(Meteor.user(), ['admin']))
}

AccountsHelper.companyMatch = function(companyId){
  var currentUser = Meteor.user();
  var currentCompany = (!currentUser || !currentUser.profile) ? null : currentUser.Companies;
  return currentCompany ? currentCompany === companyId : false;
}
AccountsHelper.signInAsCompanyUser = function(router, pause, companyId){
  return AccountsEntry.signInRequired(router, pause, (AccountsHelper.companyMatch(companyId) || Roles.userIsInRole(Meteor.user(), ['admin'])) )
}
