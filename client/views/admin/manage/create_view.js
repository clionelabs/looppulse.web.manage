Template.create_view.helpers({
  roles: function() {
    return Roles.getAllRoles();
  },
  adminRole: function() {
    return this.name === 'admin';
  }
});

Template.create_view.events({
  'submit .create-action-form': function(e, tmpl) {
    e.preventDefault();
    e.stopPropagation();
    console.log("clicked", tmpl, this)
    var $form = $(e.target)
    var collectionName = $form.data("collection")
    var obj = {}

    $form.find("input").each(function(i, v){
      var $input = $(this)
      var _field = $input.data("field-name")
      var _val = $input.val()

      obj[_field] = _val
    })

    console.log("On call", collectionName, obj)

    Meteor.call('createInCollection', collectionName, obj, function(error, res) {
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
        $form.html("Company created. id:"+res)
      }
    });

    return false;
  }
});