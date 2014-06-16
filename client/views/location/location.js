Template.location.helpers({
  company: function() {
    console.log("Instances" , this)
    console.log("Querying Company in Location", this._id)
    return Companies.findOne(this.companyId);
  },
  products: function() {
    console.log("Querying Products in Location", this, this._id)
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

    console.log("Summerize Products in Location", self, obj)

    obj.products.forEach(function(o){
      o.funnel = obj.funnels[o.installationId]
      console.log("Pairing", o.productId, o.installationId, o.funnel)
    })
    if (obj.metric) {
      obj.metric.totalVisit = obj.metric.entranceVisitors.length
    } else {
      obj.metric = { totalVisit: -1 }
    }
    console.log("Processed", obj)
    return obj;
  },
  beacons: function() {
    return Installations.find({ locationId: this._id } )
  },
  metric: function(){
    var metric = Metrics.findOne({ locationId: this._id })
    return metric;
  },
  funnels: function(metric){
    if (!metric && this) {
        metric = Metrics.findOne({ locationId: this._id })
    }

    if(!metric){
      return null;
    }
    var funnels = Funnels.find({ metricId: metric._id })
    var indexedFunnels = {};
    funnels.forEach(function(f){
      if(!indexedFunnels[f.installationId])
        indexedFunnels[f.installationId] = {}

      console.log("Funnel queued", f.installationId )

      indexedFunnels[f.installationId] = f
      var cashierVisit = f.cashierVisitors ? f.cashierVisitors.length : 0;
      var productVisit = f.productVisitors ? f.productVisitors.length : 0;
      var miss = productVisit - cashierVisit; //no teleport is allowed.
      indexedFunnels[f.installationId].cashierVisit = cashierVisit;
      indexedFunnels[f.installationId].productVisit = productVisit;
      indexedFunnels[f.installationId].missedVisit = miss;

      if (metric._id === f.metricId) {
        if (!metric.missedVisit) {
          metric.missedVisit = 0;
        }
        metric.missedVisit += miss;
      } else {
         throw new Error("Metric doesn't match current Installation");
      }
    })

    console.log("return", metric._id, metric, indexedFunnels)
    return indexedFunnels;
  },
  funnel: function(installationId){
    return this.indexedFunnels(installationId)
  }
});