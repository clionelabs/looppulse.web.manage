Template.admin_company_users.helpers({
  currentCompanyUser: function(){
    if (!this || !this.data) { return; }
    var data = this.data;
    return Meteor.users.find({"profile.Companies": data._id}, {fields:{"emails.address":1}})
  }
})