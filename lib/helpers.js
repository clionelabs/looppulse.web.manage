//helper functions for both client and server?

AccountsHelper = {};
AccountsHelper.signInAsAdmin = function(router, pause){
  return AccountsEntry.signInRequired(router, pause, Roles.userIsInRole(Meteor.user(), ['admin']))
}

AccountsHelper.companyMatch = function(companyId, userId){
  var user = null
  if(Meteor.isClient)
    user = Meteor.user();
  else if(Meteor.isServer && userId)
    user = Meteor.users.findOne(userId)

  console.log("Current User", user)

  if(Roles.userIsInRole(user, ['admin'])){
    console.log("Express")
    return true;
  }
  var currentCompany = (!user || !user.profile) ? null : user.profile.Companies;

  return currentCompany ? currentCompany === companyId : false;
}
AccountsHelper.signInAsCompanyUser = function(router, pause, companyId){
  return AccountsEntry.signInRequired(router, pause, AccountsHelper.companyMatch(companyId) )
}
