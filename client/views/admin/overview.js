Template.overview.helpers({
  locations: function(companyId) {
    console.log(this, companyId)
    return Locations.find({ companyId: companyId });
  },
  companies: function(){
    return Companies.find();
  }
});