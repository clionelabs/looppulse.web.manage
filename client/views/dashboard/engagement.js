// Helpers

/**
  All helpers need to get something from db should go to here
  context: this = `Location`
*/
Template.dashboard_engagement.helpers({
  getForm: function(){
    return [{ name: "new-engagement-name", placeholder: "Specials Promotion" }]
  },
  collectForm: function(){
  }
})
Template.dashboard_engagement.events({
  "submit #engagement-create-modal form": function(e, tmpl){
    e.preventDefault();

    Session.set("new-engagement-name", jQuery('input[name="new-engagement-name"]').val())
    console.log("Name set.", Session.get("new-engagement-name"))
    var modal =jQuery("#"+this.modalId)
    modal.on("hidden.bs.modal", function(e){
      // e.currentTarget.off("hidden.bs.modal")
      Router.go('dashboard_engagement_create', { locationId: tmpl.data._id });
    }).modal('hide');
    return false;
  }
})


Template.dashboard_engagement_create.helpers({
  transform: function(){
    var data = this.data || {};
    var settings = {
      klass: "engagement-create"
    }
    return _.extend(data, settings)
  },
  activeItem: function(){
    return { code: "Miku00001", index: 1 }
  },
  newEngagementName: function(){
    return Session.get("new-engagement-name")
  }
})

Template.dashboard_engagement_create.created = function(){
  Session.set("view-routing", true)
  Session.set("view-coupon", false)
}
Template.dashboard_engagement_create.rendered = function(){
  jQuery(".select-picker").selectpicker().on("show", function(){
    console.log("Select", this)
  });
}
Template.dashboard_engagement_create.destroyed = function(){
  delete Session.keys["view-routing"]
  delete Session.keys["view-coupon"]
}