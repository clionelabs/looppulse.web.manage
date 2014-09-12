Template.dashboard_collection_manage.helpers({

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