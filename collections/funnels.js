Funnels = new Meteor.Collection("funnels");

Funnel = function(metricId, installationId) {
  this.metricId = metricId;
  this.installationId = installationId;

  // Do not initialize these as we would over write the exisiting
  // if this particular funnel exists before.
  // this.productVisits = 0;
  // this.cashiersVisits = 0;
}

Funnel.prototype.save = function() {
  Funnels.upsert(this, this);
  this._id = Funnels.findOne(this)._id;
  return this._id;
}

Funnel.load = function(id) {
  var json = Funnels.findOne({_id: id});
  var loaded = new Funnel(json.metricId, json.installationId);
  loaded._id = json._id;
  return loaded;
}

// We use Funnel#encounters to store product encounters which do not have a
// matching cashier visit.

Funnel.prototype.incrementProductVisit = function(encounterId) {
  Funnels.update({_id: this._id},
                 {$inc: {productVisits: 1},
                  $addToSet: {encounters: encounterId}});
  // console.log("incrementProductVisit: "+ JSON.stringify(this));
}

Funnel.prototype.incrementCashierVisit = function(productEncounterId) {
  // console.log("searching: "+JSON.stringify({_id: this._id,encounters: productEncounterId}));
  Funnels.update({_id: this._id,
                  encounters: productEncounterId},

                 {$inc: {cashierVisits: 1},
                  $pull: {encounters: productEncounterId}});
  // console.log("Funnel#incrementCashierVisit ("+productEncounterId+"): "+ JSON.stringify(Funnels.findOne({_id:this._id})));
}
