Template.product.helpers({
  log:function(v) {
    console.log("product template", this, v)
  },
  //funnel processor.
  totalVisit: function(){
    if (!this || !this.metric ) { return "--"; }
    return this.metric.totalVisit || "--"
  },
  productVisit: function(){
    if (!this || !this.funnel ) { return "--"; }
    return this.funnel.productVisit || 0
  },
  cashierVisit: function(){
    if (!this || !this.funnel) { return "--"; }
    return this.funnel.cashierVisit || 0
  },
  missedVisit: function(){
    if (!this || !this.funnel) { return "--"; }
    return this.funnel.missedVisit || 0
  }
});
