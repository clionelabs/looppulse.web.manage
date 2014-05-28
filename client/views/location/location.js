Template.location.helpers({
  company: function() {
    return Companies.findOne(this.companyId);
  },
  products: function(){
    productIds = Installations.find({ locationId:"g6egbdcMarvy7tv4h"}).map(function(o){ return o.physicalId; })
    return Products.find({ _id: {$in: productIds} })
  }
  funnel: function(){
    //Location.load("EE6aGcqKm7JCHRNjb").funnel("uPLohyxQ6DcqTuqdz",1400379241000 ) =>{entrances: 0, product: 0, cashiers: 0}

  }
});