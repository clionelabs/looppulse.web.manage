Template.location.helpers({ 
  company: function() {
    return Companies.findOne(this.companyId); 
  },
  products: function(){
    productIds = Installations.find({ locationId:"g6egbdcMarvy7tv4h"}).map(function(o){ return o.physicalId; })
    return Products.find({ _id: {$in: productIds} })
    
  }
});