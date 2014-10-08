Meteor.startup(function () {

  _.extend(Notifications.defaultOptions, {
    timeout: 5000
  });

});
