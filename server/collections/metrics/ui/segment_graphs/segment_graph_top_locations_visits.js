SegmentGraphTopLocationsVisits.prototype.prepareData = function(installationVisitsEngines, installationNames) {
  var self = this;
  this.data = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    self.data.push({installationName: installationNames[iid], count: visitsEngine.queryTotalVisitsCount()});
  });
  this.data = _.sortBy(this.data, function(item) {
    return -1 * item['count'];
  });
}

