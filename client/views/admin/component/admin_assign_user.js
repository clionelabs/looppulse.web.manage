Template.admin_user_input.settings = function(){
  return {
   position: "bottom",
   limit: 5,
   rules: [
     {
       token: '',
       collection: Meteor.users,
       field: "emails.0.address",
       template: Template.userPill
     }
   ]
  }
};
Template.admin_assign_superuser.helpers({
  currentAdminUser: function(collectionName, collectionId){
    var _f = "profile."+collectionName
    if (!collectionName || !collectionId) { return; }

    var _q = {}
    _q[_f] = collectionId

    var data = Meteor.users.findOne(_q, { "emails.address":1 })
    if (data && data.emails && data.emails.length > 0) {
      return data.emails[0].address
    } else {
      return ""
    }
  },
  defaultText: function(s){
    console.log("Converting", s, this)
    if (!this) {
      return s
    } else {
      return this.toString()
    }
  }

});
Template.admin_assign_superuser.rendered = function(){
  //console.log("Hooking listener", $(".collection-processing-form"))
  $(".collection-processing-form").on('submit', function(e) { //this is a dangerous assumption
    e.preventDefault();
    console.log("clicked twice", e)
    var $form = $(e.currentTarget)
    var collectionName = $form.data("collection")
    var collectionId = $form.data("id")
    var obj = {}

    var userEmail = $form.find("#admin-email").val()

    if (collectionName && collectionId) {
      console.info("Profile Update for superuser: OK")
    } else {
      console.error("Profile Update failed: Missing related collection name or id");
      return false;
    }

    //if everything alright
    obj.collectionName = collectionName
    obj.collectionId = collectionId

    Meteor.call('updateUserProfileByEmail', userEmail , obj, function(error, res) {
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
        $form.prepend("<p>Profile updated for <span>"+collectionName+"</span> updated (returned: <span>"+res+"</span>)</p>")
      }else{
        console.log("Nothing happen", res)
      }
    });
  });
};

Template.admin_assign_user.rendered = function(){
  //console.log("Hooking listener", $(".collection-processing-form"))
  $("form.admin-assign-user").on('submit', function(e) { //this is a dangerous assumption
    e.preventDefault();
    var $form = $(e.currentTarget)
    var collectionName = $form.data("collection")
    var collectionId = $form.data("id")
    var obj = {}

    var userEmail = $("#new-user-email").val()

    if (collectionName && collectionId) {
      console.info("Profile Update for user: OK")
    } else {
      console.error("Profile Update failed: Missing related collection name or id");
      return false;
    }

    //if everything alright
    obj.collectionName = collectionName
    obj.collectionId = collectionId

    console.log(userEmail, obj)

    Meteor.call('updateUserProfileByEmail', userEmail , obj, function(error, res) {
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
        $form.prepend("<p>Profile updated for <span>"+collectionName+"</span> updated (returned: <span>"+res+"</span>)</p>")
      }else{
        console.log("Nothing happen", res)
      }
    });
  });
};