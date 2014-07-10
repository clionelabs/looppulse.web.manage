Meteor.startup(function(){
  console.info("Config on Server side")

  Accounts.config({
    forbidClientAccountCreation: true
  })
});