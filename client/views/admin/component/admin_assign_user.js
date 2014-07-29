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

Template.admin_assign_user.rendered = function(){
  console.log("Hooking listener", $(".collection-processing-form"))
  $(".collection-processing-form").on('submit', function(e) { //this is a dangerous assumption
    e.preventDefault();
    console.log("clicked twice", e)
    var $form = $(e.currentTarget)
    var collectionName = $form.data("collection")
    var collectionId = $form.data("id")
    var obj = {}

    var userEmail = $form.find("#admin-email").val()

    if (collectionName && collectionId){
      console.log("Profile Update On call", collectionName, collectionId, userEmail)
    }else{
      console.error("Profile Update failed: Missing related collection name or id");
      return false;
    }

    //if everything alright
    obj[collectionName] = collectionId

    Meteor.call('updateUserProfile', userEmail , obj, function(error, res) {
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