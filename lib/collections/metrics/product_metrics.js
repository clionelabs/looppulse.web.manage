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
 * @property visitors{}
 * @property dwellTime
 *
 */
ProductMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = ProductMetric.type;
};


ProductMetric.prototype = Object.create(BaseMetric.prototype);
ProductMetric.prototype.constructor = ProductMetric;

ProductMetric.find = function(selector) {
  var finalSelector = {type: ProductMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};



var upsertProductMetric = function(encounter) { 
  console.log("[ProductMetric] update ProductMetric " + encounter.installationId); 
  var installation = Installations.findOne({_id: encounter.installationId});
      
  var productMetric = Metrics.findOne({
    productId: installation.physicalId,
    locationId: installation.locationId,
    startTime: { $lt: encounter.exitAt },
    endTime: { $gt:  encounter.exitAt }

  });

  if (!productMetric) {
    productMetric = new ProductMetric({
      productId: installation.physicalId,
      locationId: installation.locationId,
      startTime: getStartTime(),
      endTime: new Date(getStartTime() + ProductMetric.interval).getTime()
    });
  }

  productMetric.handleEncounterAdd(encounter);
}

var getStartTime = function() {

  var startTimeExact = new Date(); 
  return new Date(startTimeExact.getFullYear(),
                      startTimeExact.getMonth(),
                      startTimeExact.getDate(),
                      startTimeExact.getHours())
                        .getTime();
}

ProductMetric.prototype.handleEncounterAdd = function(encounter) {
  var visitorId = encounter.visitorId;
  var duration = encounter.duration;

  var selector = {
    productId: this.productId,
    locationId: this.locationId,
    type: this.type
  };

  var modifier = {
    $inc : { dwellTime: duration },
    $addToSet : { visitors : visitorId }
  }

  var result = Metrics.upsert(selector, modifier);
  //TODO to a helper function?
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Metrics.findOne(selector)._id;
  }
  console.log("ProductMetric saved" + JSON.stringify(Metrics.findOne(selector)));
  return this._id;
}

ProductMetric.prototype.getVisitorsCount = function() {
  return Object.keys(this.visitors).length;
}


ProductMetric.startup = function() {
  Encounters
      .find({duration : {$gt : 0}})
      .observe({
        _suppress_initial: true,
        "added": upsertProductMetric,
      });
}

ProductMetric.type = "product";
ProductMetric.interval = 60 * 60 * 1000 - 1;
