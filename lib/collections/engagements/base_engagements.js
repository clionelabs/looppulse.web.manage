// TODO replace Engagement with this class
/**
 *
 * @param doc
 * @constructor
 *
 * @property {string} segmentId
 * @property {string} name
 * @property validPeriod
 * @property {string[]} triggerInstallationIds
 */
BaseEngagement = function(doc) {
  _.extend(this, doc);
};

BaseEngagement.prototype.atTriggerInstallation = function(encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)) {
    return encounter.isQualified();
  }
  return false;
};

BaseEngagement.prototype.description = function() {
  var text = "Engage ";
  if (this.segmentId) {
    var segment = Segments.findOne(this.segmentId);
    if (segment) {
      text += segment.description() + " ";
    } else {
      console.error("Unknown segment [%s] for engagement [%s]", this.segmentId, this._id);
    }
  }
  if (this.validPeriod) {
    var start = new Date(this.validPeriod.start);
    var end = new Date(this.validPeriod.end);
    // TODO different date format / shorter date string?
    text += "from " + start + " to " + end;
  }
  return text;
};
