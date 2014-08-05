Template.admin_company_users.helpers({
  currentCompanyUser: function(){
    if (!this || !this.data) { return; }
    var data = this.data;

    console.log(this, data)
    return Meteor.users.find({"profile.Companies": data._id}, {fields:{"emails.address":1}})
  },
  settings: function () {
         return {
             rowsPerPage: 10,
             showFilter: true,
             fields: ['_id', "emails.0.address"]
         };
  }
})