Template.admin_company_users.helpers({
  currentCompanyUser: function(){
    if (!this || !this.data) { return; }
    var data = this.data;
    return Meteor.users.find({"profile.Companies": data._id}, {fields:{"emails.address":1}})
  }
})

Template.admin_company_users.events({
  'click .remove-link': function(e, tmpl) {
    var $target = $(e.target)
    var userId = $target.data("user-id");
    var obj = {};

    obj.key = "Companies"
    obj.val = ""

    Meteor.call('updateUserProfileById', userId , obj, function(error, res) {
      if (error) {
        // optionally use a meteor errors package
        if (typeof Errors === "undefined")
          Log.error('Error: ' + error.reason);
        else {
          Errors.throw(error.reason);
        }
      }
      //Clean Up if everything is fine.
      if (res) {
        console.info("User '"+userId+"'  Removed.")
      }else{
        console.info("Nothing happen", res)
      }
    });

  }
});