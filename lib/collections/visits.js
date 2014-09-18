Visit = function(encounters) {
  this.installations = encounters.map(function(encounter) {
    return Installations.findOne(encounter.installationId);
  });
}

// Each subPath contains three keys:
// + entrances: entrance installations which this visitors visited.
// + closed:    product installations which were successfully converted
// + open:      product installations which failed to convert
// TODO: Each visitor will only have one path per metric's time range.
Visit.prototype.subPaths = function() {
  var self = this;
  var subPath = new SubPath();
  _.each(self.installations, function(installation, index, list) {
    if (installation.isProduct()) {
      var rest = _.last(list, list.length-(index+1));
      if (self.didEncounterCashier(rest)) {
        subPath.closed.push(installation);
      } else {
        subPath.open.push(installation);
      }
    } else if (installation.isEntrance()) {
      // TODO: Need to be more sophisticated about when a visit is an entrance
      // because the encounter could have meant to be an exit instead.
      subPath.entrances.push(installation);
    }
  });
  return [subPath];
}

// Any given installation is a cashier?
Visit.prototype.didEncounterCashier = function(nextInstallations) {
  return _.some(nextInstallations,
                function(installation) { return installation.isCashier(); }
               );
}

SubPath = function() {
  this.entrances = [];
  this.closed = [];
  this.open = [];
}
