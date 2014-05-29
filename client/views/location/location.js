Template.location.helpers({
  company: function() {
    console.log("Querying Company in Location", this._id)
    return Companies.findOne(this.companyId);
  },
  products: function(){
    console.log("Querying Products in Location", this, this._id)
    productIds = Installations.find({ locationId: this._id}).map(function(o){ return o.physicalId; })
    return Products.find({ _id: {$in: productIds} })
  },
  funnel: function(productId, location){
    if(!productId){ return null; }
    return Location.create(this._id).funnel(productId)
    //Location.load("EE6aGcqKm7JCHRNjb").funnel("uPLohyxQ6DcqTuqdz",1400379241000 ) =>{entrances: 0, product: 0, cashiers: 0}

  },
  productFunnels: function(){

  }
});