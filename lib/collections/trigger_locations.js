TriggerLocation = function(companyId, triggerLocations) {
  this.companyId = companyId;
  this.triggerLocations = triggerLocations;
};

TriggerLocation.prototype.installationIds = function() {
  var orSelectors = _.map(this.triggerLocations, function(triggerLocation) {
    if (triggerLocation.floorLevel) {
      return { "coord.z": floorLevel };
    } else if (triggerLocation.productId) {
      return {
        type: "product",
        physicalId: triggerLocation.productId
      }
    } else if (triggerLocation.categoryId) {
      var productIds = Products.find({categoryId: triggerLocation.categoryId}).map(function(product) {
        return product._id;
      });
      return {
        type: "product",
        physicalId: { $in: productIds }
      };
    }
  });

  var locationIds = Locations.find({companyId: this.companyId}).map(function(location) {
    return location._id;
  });
  return Installations.find({
    locationId: { $in: locationIds },
    $or: orSelectors
  }).map(function(installation) {
    return installation._id;
  });
};
