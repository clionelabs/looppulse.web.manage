var handleClosedEncounterAdded = function (encounter) {
  var selector = {
    type: VisitorMetric.type,
    visitorId: encounter.visitorId
  };

  {
    var hourlySelector = _.extend({
      resolution: Metric.hourly,
      startTime: truncateToHours(encounter.enteredAt)
    }, selector);
    var anHour = 1000 * 60 * 60;
    // TODO extract this to helper function
    if (hourlySelector.startTime <= encounter.enteredAt && encounter.enteredAt < hourlySelector.startTime + anHour) {
      var hourlyModifier = {
        $inc: {
          visitCount: 1,
          dwellTime: encounter.duration
        }
      };
      Metrics.upsert(hourlySelector, hourlyModifier);
    }
  }

  {
    var dailySelector = _.extend({
      resolution: Metric.daily,
      startTime: truncateToDays(encounter.enteredAt)
    }, selector);
    var aDay = anHour * 24;
    if (dailySelector.startTime <= encounter.enteredAt && encounter.enteredAt < dailySelector.startTime + aDay) {
      var dailyModifier = {
        $inc: {
          visitCount: 1,
          dwellTime: encounter.duration
        }
      };
      Metrics.upsert(dailySelector, dailyModifier);
    }
  }

  {
    var foreverSelector = _.extend({
      resolution: Metric.forever
    }, selector);
    var foreverModifier = {
      $inc: {
        visitCount: 1,
        dwellTime: encounter.duration
      }
    };
    Metrics.upsert(foreverSelector, foreverModifier);
  }
};

// TODO reuse installation_metrics one
var truncateToHours = function (milliseconds) {
  return MetricsHelper.truncatedDateToHours(new Date(milliseconds)).getTime();
};

var truncateToDays = function (milliseconds) {
  return MetricsHelper.truncatedDateToDate(new Date(milliseconds)).getTime();
};

VisitorMetric.startup = function () {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleClosedEncounterAdded
  });
};
