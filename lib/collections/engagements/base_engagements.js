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

BaseEngagement.prototype.isReady = function() {
  if (!this.validPeriod) {
    return true;
  }

  var now = new Date();

  return (this.isReadyByStartEnd(this.validPeriod.start, this.validPeriod.end, now) &&
          this.isReadyByDayOfWeek(this.validPeriod.dayOfWeek, now) &&
          this.isReadyByTimePeriods(this.validPeriod.timePeriods, now));
};

BaseEngagement.prototype.isReadyByStartEnd = function(start, end, now) {
  if (start && now.getTime() < start) {
    return false;
  }
  if (end && now.getTime() > end) {
    return false;
  }
  return true;
};

BaseEngagement.prototype.isReadyByDayOfWeek = function(dayOfWeek, now) {
  if (!dayOfWeek || dayOfWeek.length === 0) {
    return true;
  }

  return !!_.find(dayOfWeek, function(day) {
    return day === now.getDay();
  });
};

BaseEngagement.prototype.isReadyByTimePeriods = function(timePeriods, now) {
  if (!timePeriods || timePeriods.length === 0) {
    return true;
  }

  var minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

  return !!_.find(timePeriods, function(timePeriod) {
    return timePeriod.start <= minutesSinceMidnight && minutesSinceMidnight <= timePeriod.end;
  });
};

BaseEngagement.prototype.atTriggerInstallations = function(encounter) {
  if (_.contains(this.triggerInstallationIds, encounter.installationId)) {
    var isQualified = encounter.isQualified();
    if (!isQualified) {
      console.warn("[Engagement] "+this._id+" is rejected due to disqualified Encounter["+encounter._id+"]");
    }
    return isQualified;
  }
  return false;
};

BaseEngagement.prototype.leavingTriggerInstallations = function (encounter) {
  return (encounter.isClosed() && this.atTriggerInstallations(encounter));
}

BaseEngagement.prototype.enteringTriggerInstallations = function (encounter) {
  return (encounter.isEnter() && this.atTriggerInstallations(encounter));
}


BaseEngagement.prototype.recentlyStayedAt = function (visitorId, installationIds, enteredAtStart, enteredAtEnd, minDurationInMillisecond) {
  if (!installationIds || installationIds.length == 0) {
    return false;
  }

  var self = this;
  if (typeof minDurationInMillisecond === 'undefined'){
    minDurationInMillisecond = 1000; // For debug proposes to have a short min. duration
  }
  var previousVisit = Encounters.findOne({
    visitorId: visitorId,
    installationId: {$in: installationIds},
    enteredAt: {$gte: enteredAtStart, $lt: enteredAtEnd},
    duration: {$gte: minDurationInMillisecond}
  });
  return !!previousVisit;
}

BaseEngagement.prototype.customizedEngagementContext = function (encounter) {
  var recommendInstallationId = Random.choice(this.recommendInstallationIds);
  var context = this.context[recommendInstallationId.toString()];

  // Create a new context which is unique to each of the recipient.
  var engagementContext = new EngagementContext(this._id,
                                                encounter.visitorId,
                                                context.alertMessage,
                                                context.inAppAssetURL);
  engagementContext.save();
  return engagementContext;
}

BaseEngagement.prototype.trigger = function (encounter) {
  var engagementContext = this.customizedEngagementContext(encounter);
  engagementContext.deliver();
}
