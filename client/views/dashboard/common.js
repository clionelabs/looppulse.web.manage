Template.dashboard_collection_manage.helpers({

})
Template.dashboard_collection_manage.events({
  "submit #collection-create-modal form": function(e, tmpl){
    console.log("on submit",this, e, tmpl)
    e.preventDefault();
    var key = "new-"+this.context+"-name"
    var path = "dashboard_"+this.context+"_create"
    Session.set(key, jQuery('input[name="new-collection-name"]').val())
    console.log("Name set.", Session.get(key))
    var modal =jQuery("#collection-create-modal")
    modal.on("hidden.bs.modal", function(e){
      // e.currentTarget.off("hidden.bs.modal")
      var s = Session.get("currentLocation")
      console.log(path, s)
      Router.go(path, { locationId: s });
    }).modal('hide');
    return false;
  }
})
Template.dashboard_collection_create.helpers({
  title: function(){
    console.log(this, this.data)
    return "Create a New "+this.context
  },
  confirm:function(){
    return "Create"+this.context
  }
})

