InstallationMetrics = {};

/**
 *
 * @param doc
 * @constructor
 *
 * @property type
 * @property installationId
 * @property locationId  - Denormalized from Installation
 */
InstallationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = InstallationMetric.type;
};

InstallationMetric.prototype = Object.create(BaseMetric.prototype);
InstallationMetric.prototype.constructor = InstallationMetric;

InstallationMetric.type = "installation";
