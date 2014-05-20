Template.location.helpers({ 
  company: function() {
    return Companies.findOne({_id: this.company_id}); 
  },
  products: function(){
    if (this.product_ids && this.product_ids.length > 0) {
      return Products.find({_id: { $in: this.product_ids }});
    } else {
      console.log(this.product_ids)
      return [];
    }
  }
});