ProductMetrics = new Meteor.Collection('product_metrics', {
  transform: function(doc) {
    return new ProductMetric(doc);
  }
});

/**
 * - belongs to a {@link Installation}
 *
 * @param doc
 * @constructor
 *
 * @property _id
 * @property type
 * @property productId
 * @property locationId
 * @property startTime
 * @property endTime
 * @property visitors[]
 * @property dwellTime
 *
 */
ProductMetric = function(doc) {
  BaseMetric.call(this, this, doc);
  this.productId = doc.productId;
  this.locationId = doc.locationId;
  this.type = ProductMetric.type;
  this.dwellTime = 0;
  this.visitors = [];
  var startTimeExact = new Date(); 
  this.startTime = new Date(startTimeExact.getFullYear(), startTimeExact.getMonth(), startTimeExact.getDate(), startTimeExact.getHours());
  this.endTime = new Date(this.startTime.getTime() + ProductMetric.interval);
};

ProductMetric.prototype = Object.create(BaseMetric.prototype);
ProductMetric.prototype.constructor = ProductMetric;

ProductMetric.prototype.save = function() {
  var selector = {
    productId: this.productId,
    locationId: this.locationId,
    type: this.type
  };
  ProductMetrics.upsert(selector, this);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = ProductMetrics.findOne(selector)._id;
  }
  return this._id;
}


ProductMetrics.upsert = function(encounter) {
  if (encounter.duration === 0) {
    //Do nothing when the encounter is not finished 
    return;
  }
  var installation = Installations.findOne({_id: encounter.installationId});
  var product = Products.findOne({_id: installation.physicalId});
      
  var productMetrics = ProductMetrics.find({
    productId: installation.physicalId,
    locationId: installation.locationId,
    startTime: { $lt: encounter.exitAt },
    endTime: { $gt:  encounter.exitAt }

  });

  if (productMetrics.count() > 0) {
    productMetrics.forEach(function(productMetric) { 
      productMetric.handleEncounterAdd(encounter);
      productMetric.save();
    });
  } else {
      productMetric = ProductMetric.create(installation);
      productMetric.handleEncounterAdd(encounter);
      productMetric.save();
    
  }
}

ProductMetric.prototype.handleEncounterAdd = function(encounter) {
  var visitorId = encounter.visitorId;
  var duration = encounter.duration;
  productMetric.dwellTime = dwellTime + duration;
  var isVisitorUnique = true;
  //Meteor.Collection is hard to test, so use native
  for (var i = 0; i < visitors.length; i++) {
    if (visitors[i] === visitorId) {
      isVisitorUnique = false;
    }
  }
  if (isVisitorUnique) { 
    productMetric.visitors.push(visitorId); 
  }
}

ProductMetric.prototype.getVisitorsCount = function() {
  return visitors.count();
}


ProductMetric.startup = function() {
  Encounters
      .find({
        type: 'product'
      })
      .observe({
        _suppress_initial: true,
        "changed": ProductMetrics.upsert     
      });
}

ProductMetric.type = "product";
ProductMetric.interval = 60 * 60 * 1000 - 1;
