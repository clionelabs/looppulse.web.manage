/**
 *
 * @param {string} companyId
 * @param {object[]} triggerLocations  - array of `$or` filters, empty array mean no filters
 * @param [locationIds]
 * @constructor
 */
TriggerLocation = function(companyId, triggerLocations, locationIds) {
  this.companyId = companyId;
  this.triggerLocations = triggerLocations;
  this.locationIds = locationIds;
};

TriggerLocation.prototype.installationIds = function() {
  var orSelectors = _.map(this.triggerLocations, function(triggerLocation) {
    if (triggerLocation.floorLevel) {
      return { "coord.z": triggerLocation.floorLevel };
    } else if (triggerLocation.productId) {
      return {
        productId: triggerLocation.productId
      }
    } else if (triggerLocation.categoryId) {
      var productIds = Products.find({categoryId: triggerLocation.categoryId}).map(function(product) {
        return product._id;
      });
      return {
        productId: { $in: productIds }
      };
    }
  });

  var selector = { locationId: { $in: this.getLocationIds() } };
  if (orSelectors.length > 0) {
    selector.$or = orSelectors;
  }
  return Installations.find(selector).map(function(installation) {
    return installation._id;
  });
};

TriggerLocation.prototype.getLocationIds = function() {
  if (this.locationIds) {
    return this.locationIds;
  }
  return Locations.find({ companyId: this.companyId }).map(function(location) {
    return location._id;
  });
};
