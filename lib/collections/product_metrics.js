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
 * @property startTime
 * @property endTime
 * @property visitors[]
 * @property dwellTime
 *
 */
ProductMetric = function(doc) {
  BaseMetric.call(this, this, doc);
  this.type = ProductMetric.type;
  this.dwellTime = 0;
  this.visitorCount = 0;
};

ProductMetric.prototype = Object.create(BaseMetric.prototype);
ProductMetric.prototype.constructor = ProductMetric;

ProductMetric.prototype.save = function() {
  var selector = {
    productId: this.productId,
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

ProductMetric.create = function(product) {
  var product = new ProductMetric({productId: product._id});
  product.save();
}


ProductMetric.update = function(encounter) {
  var installations = Installations.find({_id: encounter.installationId});
  var duration = encounter.duration;
  installations.forEach(function(installation) {
      
    var productMetrics = ProductMetrics.find({productId: installation.physicalId});

    productMetrics.forEach(function(productMetric) { 
      productMetric.dwellTime = dwellTime + duration;
      productMetric.visitorCount++;

      productMetric.save();
    });
  });
}


ProductMetric.startup = function() {
  var productId = this.productId;
  var installations = Installations.find({physicalId: productId});
  installations.forEach(function (installation) {

    Encounters
      .find({
        installationId : installation._id,
        type: 'product'
      })
      .observe({
        _suppress_initial: true,
        "added": ProductMetric.update      
      });

  });
  Products.find().observe({
    _suppress_initial: true,
    "added": ProductMetric.create
  });
}



ProductMetric.type = "product";
