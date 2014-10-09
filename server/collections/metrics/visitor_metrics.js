var handleClosedEncounterAdded = function (encounter) {
  var selector = {
    type: VisitorMetric.type,
    visitorId: encounter.visitorId
  };

  {
    var hourlySelector = _.extend({
      resolution: Metric.hourly,
      startTime: +moment(encounter.enteredAt).startOf('hour')
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
      startTime: +moment(encounter.enteredAt).startOf('day')
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

VisitorMetric.startup = function () {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleClosedEncounterAdded
  });
};
