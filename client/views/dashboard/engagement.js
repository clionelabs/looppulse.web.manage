// Helpers

/**
  All helpers need to get something from db should go to here
  context: this = `Location`
*/
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
  }
})

Template.dashboard_engagement_create.created = function(){
  Session.set("view-routing", true)
  Session.set("view-coupon", false)
}
Template.dashboard_engagement_create.destroyed = function(){
  delete Session.keys["view-routing"]
  delete Session.keys["view-coupon"]
}