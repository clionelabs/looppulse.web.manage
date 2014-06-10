Template.location.helpers({
  company: function() {
    console.log("Querying Company in Location", this._id)
    return Companies.findOne(this.companyId);
  },
  products: function() {
    console.log("Querying Products in Location", this, this._id)
    productIds = Installations.find({ locationId: this._id }).map(function(o){ return o.physicalId; })
    return Products.find({ _id: { $in: productIds } })
  },
  beacons: function() {
    return Installations.find({ locationId: this._id } )
  }
});