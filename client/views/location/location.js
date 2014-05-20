Template.location.helpers({ 
  company: function() {
    return Companies.findOne({_id: this.company_id}); 
  },
  products: function(){
    return Products.find({_id: { $in: this.product_ids }});
  }
});