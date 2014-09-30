// Session variables
Session.set('initialLoad', true);
Session.set('today', new Date());
Session.set('sessionId', Meteor.default_connection._lastSessionId);

(function(){

  var config = Meteor.settings["public"];



})();

// Notifications - only load if user is logged in
// Not mandatory, because server won't publish anything even if we try to load.
// Remember about Deps.autorun - user can log in and log out several times
// Deps.autorun(function() {
//   // userId() can be changed before user(), because loading profile takes time
//   if(Meteor.userId()) {
//     Meteor.subscribe('notifications');
//     if(isAdmin(Meteor.user())){
//       // Subscribe to all users for now to make user selection autocomplete work
//       Meteor.subscribe('allUsersAdmin');
//     }
//   }
// });


Meteor.startup(function () {
    _.extend(Notifications.defaultOptions, {
        timeout: 5000
    });
})


Deps.autorun(function(computation){
  //var companyId = Session.get("companyId");
  var locationId = null;
  var installationIds = null;

  computation.onInvalidate(function() {
    console.log("Re-running...")
    //console.trace();
  });

  // standard autorun code...
  //console.log("Subscribing..", companyId);
  // Meteor.subscribe('owned-company', companyId, {
  //   onReady: function(){
  //     console.log("Returned", companyId)
  //     var id = Companies.findOne({_id: companyId});

  //     Session.set("verifiedCompany", ((id) ? true : false))
  //   },
  //   onError: function(){
  //     console.log("Companies Not Found ",companyId)
  //     //Say goodbye to user.
  //   }
  // }

  // );
});