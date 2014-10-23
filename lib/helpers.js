//helper functions for both client and server?

AccountsHelper = {};
AccountsHelper.signInAsAdmin = function(router, pause){
  return AccountsEntry.signInRequired(router, pause, Roles.userIsInRole(Meteor.user(), ['admin']))
}

AccountsHelper.companyMatch = function(companyId, userId){
  var user = null
  if (Meteor.isClient) {
    user = Meteor.user();
  } else if (Meteor.isServer && userId) {
    user = Meteor.users.findOne(userId)
  }

  if (user) {
    console.info("Current User", user._id)
  }

  if (Roles.userIsInRole(user, ['admin'])) {
    console.log("Express")
    return true;
  }
  var currentCompany = (!user || !user.profile) ? null : user.profile.Companies;

  return currentCompany ? currentCompany === companyId : false;
}
AccountsHelper.fieldMatch = function(field, _id, userId){
  return userId ? true : false;
}
AccountsHelper.signInAsCompanyUser = function(router, pause, companyId){
  return AccountsEntry.signInRequired(router, pause, AccountsHelper.companyMatch(companyId) )
}
AccountsHelper.signInAsCompanyUserByLocation = function(router, pause, locationId){
  console.log("Checking access rights")
  return AccountsEntry.signInRequired(router, pause, Roles.userIsInRole(Meteor.user(), ['admin']))
}

AccountsHelper.canViewSegment = function(segmentId) {
  var segment = Segments.findOne(segmentId);
  if (!segment) {
    return false;
  }
  return AccountsHelper.companyMatch(segment.companyId, Meteor.userId());
};

LocationsHelper = {};

LocationsHelper.getCommonLocationMap = function(ids, prefix){

}

LocationsHelper.getCompanyId = function(id){
  if(!id){
    id = Session.get("currentLocation")
  }
  var loc = Locations.findOne({_id:id})
  return loc ? loc.companyId : null;
}
