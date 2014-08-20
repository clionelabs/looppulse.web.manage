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
  BaseMetric.call(this, doc);
  this.type = ProductMetric.type;
  this.dwellTime = 0;
  this.visitors = {};
  var startTimeExact = new Date(); 
  //TODO to a helper function?
  this.startTime = new Date(startTimeExact.getFullYear(), startTimeExact.getMonth(), startTimeExact.getDate(), startTimeExact.getHours()).getTime();
  this.endTime = new Date(this.startTime + ProductMetric.interval).getTime();
};


ProductMetric.prototype = Object.create(BaseMetric.prototype);
ProductMetric.prototype.constructor = ProductMetric;

ProductMetric.prototype.save = function() {
  var selector = {
    productId: this.productId,
    locationId: this.locationId,
    type: this.type
  };
  var result = Metrics.upsert(selector, this);
  //TODO to a helper function?
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Metrics.findOne(selector)._id;
  }
  return this._id;
}


var upsertProductMetric = function(encounter) { 
  var installation = Installations.findOne({_id: encounter.installationId});
      
  var productMetric = Metrics.findOne({
    productId: installation.physicalId,
    locationId: installation.locationId,
    startTime: { $lt: encounter.exitAt },
    endTime: { $gt:  encounter.exitAt }

  });

  if (productMetric === null) {
    productMetric = new ProductMetric({
      productId: installation.productId,
      locationId: installation.locationId
    });
  }

  productMetric.handleEncounterAdd(encounter);
  productMetric.save();
}

ProductMetric.prototype.handleEncounterAdd = function(encounter) {
  var visitorId = encounter.visitorId;
  var duration = encounter.duration;
  this.dwellTime = this.dwellTime + duration;
  this.visitors[visitorId] = true; 
}

ProductMetric.prototype.getVisitorsCount = function() {
  return Object.keys(this.visitors).length;
}


ProductMetric.startup = function() {
  Encounters
      .find({
        duration: { $gt : 0 },
        type: 'product'
      })
      .observe({
        _suppress_initial: true,
        "added": upsertProductMetric,
        "changed": upsertProductMetric     
      });
}

ProductMetric.type = "product";
ProductMetric.interval = 60 * 60 * 1000 - 1;
