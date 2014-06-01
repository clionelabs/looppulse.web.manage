Template.product.helpers({
  log:function(v) {
    console.log("product template", this, v)
  },
  //funnel processor.
  // return funnel {entrances: 0, product: 0, cashiers: 0}
  funnel: function(){
    var product = this.product;
    var location = this.location;
    if(!product || !location){ return null; }
    var locator = Location.create(location._id);
    console.log("locator:", locator, product)
    if(locator){
      var funnel = locator.funnel(product._id)
      funnel.missed = funnel.product - funnel.cashiers
      return funnel
    }
    return null;
  },
  fraction: function(a,b){
    return (a/b*100).toFixed(2)+"%"
  }
});
