Template.collection_update_view.helpers({
})


Template.collection_update_view.events({
  'submit .collection-update-form': function(e, tmpl) {
    e.preventDefault();
    console.log("clicked", tmpl, this)
    var $form = $(e.target)
    var collectionName = $form.data("collection")
    var _id = $form.data("id")
    var obj = {}

    $form.find("input").each(function(i, v){
      var $input = $(this)
      var _field = $input.data("field-name")
      if (! _field) { return;  }
      var _val = $input.val()

      obj[_field] = _val
    })

    console.log("Update On call", collectionName, obj)

    Meteor.call('updateInCollection', collectionName, _id, obj, function(error, res) {
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
        $form.prepend("<p>Item in <span>"+collectionName+"</span> updated (ref id: <span>"+res+"</span>)</p>")
        $form.find("div.form-group").hide()
        $form.find(".action-btn").hide()
      }
    });
  }
});