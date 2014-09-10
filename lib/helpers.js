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

MetricsHelper = {};

MetricsHelper.nameOfSentMessageCount = function(engagementId) {
  return 'sent-message-count-of-engagement-' + engagementId;
};

MetricsHelper.nameOfViewedMessageCount = function(engagementId) {
  return 'viewed-message-count-of-engagement-' + engagementId;
};

MetricsHelper.nameOfVisitedMessageCount = function(engagementId) {
  return 'visited-message-count-of-engagement-' + engagementId;
};

MetricsHelper.truncatedDateToHours = function(date) {
  var date = new Date(date);
  date.setMinutes(0);
  date.setMilliseconds(0);
  return date;
};

MetricsHelper.truncatedDateToDate = function(date) {
  var date = new Date(date);
  date.setHours(0);
  date.setMinutes(0);
  date.setMilliseconds(0);
  return date;
};

MetricsHelper.nDaysAgo = function(currentDate, numberOfDays) {
  var resultDate = new Date();
  resultDate.setDate(currentDate.getDate() - numberOfDays);
  return resultDate;
};

MetricsHelper.nHoursAgo = function(currentDate, numberOfHours) {
  var resultDate = new Date();
  resultDate.setHours(currentDate.getHours() - numberOfHours);
  return resultDate;
};

MetricsHelper.nDaysAgoTruncatedTime = function(currentDate, numberOfDays) {
  return MetricsHelper.truncatedDateToDate(
    MetricsHelper.nDaysAgo(currentDate, numberOfDays)
  ).getTime();
};

MetricsHelper.nHoursAgoTruncatedTime = function(currentDate, numberOfHours) {
  return MetricsHelper.truncatedDateToHours(
    MetricsHelper.nHoursAgo(currentDate, numberOfHours)
  ).getTime();
};

MetricsHelper.hourlyStartTimeSince = function(startDate) {
  // TODO better implementation
  var now = new Date();
  var currentDate = MetricsHelper.truncatedDateToHours(startDate);
  var result = [];
  while (currentDate < now) {
    result.push(currentDate.getTime());
    currentDate.setHours(currentDate.getHours() + 1);
  }
  return result;
};
