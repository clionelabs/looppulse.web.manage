Template.admin_collection_actions.helpers({
  getWrapperObject: function(o){
    var wrapper = {}
    wrapper.companyId = o._id
    return wrapper;
  }

})