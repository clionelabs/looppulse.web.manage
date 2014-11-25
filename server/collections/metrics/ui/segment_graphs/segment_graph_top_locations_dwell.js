SegmentGraphTopLocationsDwell.prototype.prepareData = function(installationVisitsEngines, installationNames) {
  var self = this;
  this.data = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    self.data.push({installationName: installationNames[iid], duration: visitsEngine.queryAverageDuration()});
  });
  this.data = _.sortBy(this.data, function(item) {
    return -1 * item['duration'];
  });
}

