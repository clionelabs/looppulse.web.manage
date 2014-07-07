// RecommendationEngagements = new Meteor.Collection("RecommendationEngagements", {
//   transform: function (doc) { return new RecommendationEngagement(doc); }
// });
//
// RecommendationEngagement = function (doc) {
//   _.extend(this, doc);
// }
//
// RecommendationEngagement.prototype.readyToTrigger = function (encounter) {
//   var self = this;
//   var installation = Installations.find({ _id: encounter.installationId });
//   if (self.triggerInstallationIds.contains(installation._id)) {
//     // Check if we have previous visited installations to be recommended.
//     var visitedInstallations = [];
//     if (self.recommendInstallationIds - visitedInstallationIds) {
//       return true;
//     }
//   }
//   return false;
// }
//
// RecommendationEngagement.prototype.trigger = function (encounter) {
//
// }
//
// RecommendationEngagement.prototype.message = function (encounter) {
//
// }
