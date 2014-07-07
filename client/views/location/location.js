Template.location.helpers({
  company: function() {
    console.log("Instances" , this)
    //console.log("Querying Company in Location", this._id)
    return Companies.findOne(this.companyId);
  },
  products: function() {
    //console.log("Querying Products in Location", this, this._id)
    var installs = Installations.find({ locationId: this._id });
    var productMap = []
    var productIds = [];
    installs.forEach(function(o){
      //{ installationId: o._id,  productId: o.physicalId }
      productIds.push(o.physicalId)
      productMap[o.physicalId] = o._id
    })
    var products = Products.find({ _id: { $in: productIds } })
    var relations = []

    products.forEach(function(o){
      relations.push({
        product: o,
        installationId: productMap[o._id],
        productId: o._id
      })
    })
    return relations;
  },
  summerizedProducts: function(self){
    if (!self || !self.hash.funnels) {
      return null
    }

    var obj = self.hash;

    console.log("Summerize Products in Location (funnel updates)", this._id)

    obj.products.forEach(function(o){
      o.funnel = obj.funnels[o.installationId]
      // console.log("Pairing", o.productId, o.installationId, o.funnel)
    })
    if (obj.metric) {
      obj.metric.totalVisit = (obj.metric.entranceVisitors)  ? obj.metric.entranceVisitors.length : 0;
    } else {
      obj.metric = { totalVisit: 0 }
    }
    //console.log("Processed", obj)
    return obj;
  },
  beacons: function() {
    return Installations.find({ locationId: this._id } )
  },
  metric: function(){
    var metric = Metric.load({ locationId: this._id })
    if (!metric) {
      return null;
    }

    return metric;
  },
  funnels: function(metric){
    //console.log("Enter funnels")
    if (!metric && this) {
        metric = Metric.load({ locationId: this._id })
    }

    if(!metric){
      return null;
    }
    var funnels = Funnels.find({ metricId: metric._id })
    var indexedFunnels = {};
    funnels.forEach(function(f){
      if(!indexedFunnels[f.installationId])
        indexedFunnels[f.installationId] = {}

      var funnel = Funnel.load({}, f)
      indexedFunnels[f.installationId] = funnel
      //console.log("Mapped", f.installationId, funnel)
      var cashierVisit = funnel.cashierVisits();
      var productVisit = funnel.productVisits();
      var miss = productVisit - cashierVisit; //no teleport is allowed.
      indexedFunnels[f.installationId].cashierVisit = cashierVisit;
      indexedFunnels[f.installationId].productVisit = productVisit;
      indexedFunnels[f.installationId].missedVisit = miss;

    })
    return indexedFunnels;
  },
  funnel: function(installationId){
    return this.indexedFunnels(installationId)
  }
});