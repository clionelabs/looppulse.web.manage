/**
 *
 * @param {string} companyId
 * @param {object[]} triggerLocations  - array of `$or` filters, empty array mean no filters
 * @constructor
 */
TriggerLocation = function(companyId, triggerLocations) {
  this.companyId = companyId;
  this.triggerLocations = triggerLocations;
};

TriggerLocation.prototype.installationIds = function() {
  var orSelectors = _.map(this.triggerLocations, function(triggerLocation) {
    if (triggerLocation.floorLevel) {
      return { "coord.z": triggerLocation.floorLevel };
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
  var selector = { locationId: { $in: locationIds } };
  if (orSelectors.length > 0) {
    selector.$or = orSelectors;
  }
  return Installations.find(selector).map(function(installation) {
    return installation._id;
  });
};
