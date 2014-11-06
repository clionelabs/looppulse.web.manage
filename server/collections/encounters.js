Encounters.createOrUpdate = function (beaconEvent) {
  var installation = Installations.findOne({beaconId: beaconEvent.beaconId});
  if (!installation) {
    console.warn("[Encounter] Beacon missing installation:", beaconEvent.beaconId);
    return;
  }
  var encounter;
  if (beaconEvent.isEnter()) {
    encounter = new Encounter(beaconEvent.visitorId, installation._id, beaconEvent.createdAt);
  } else if (beaconEvent.isExit()) {
    encounter = Encounters.findLastOpen(beaconEvent, installation);
    if (encounter) {
      encounter.close(beaconEvent.createdAt);
    } else {
      console.warn("[Encounter] Enter event missed / not processed:", beaconEvent.beaconId);
      return;
    }
  } else {
    return;
  }
  return encounter.save();
};

Encounter.ensureIndex = function () {
  Encounters._ensureIndex({
    visitorId: 1,
    installationId: 1,
    enteredAt: 1,
    exitedAt: 1,
    duration: 1,
    'enteredAtParts.dayOfWeek': 1
  });
};

Encounter.startup = function () {
  BeaconEvents.find().observe({
    _suppress_initial: true,
    "added": function (beaconEvent) {
      Benchmark.time(
        function() { Encounters.createOrUpdate(beaconEvent); },
        "[Benchmark] BeaconEvents:added => Encounters.createOrUpdate"
        );
    }
  });
  console.info("[Encounter] startup complete");
};

Encounters.durationSelector = function (durationInMinutes) {
  var selector = {};
  selector['duration'] = {};
  if (durationInMinutes.atLeast !== undefined) {
    selector['duration'].$gte = durationInMinutes.atLeast * 60 * 1000;
  }
  if (durationInMinutes.atMost !== undefined) {
    selector['duration'].$lte = durationInMinutes.atMost * 60 * 1000;
  }
  return selector;
};

Encounters.everySelector = function (every) {
  var selector = {};
  switch (every) {
    case "weekdays":
      selector["enteredAtParts.dayOfWeek"] = { $gte: 1, $lte: 5 };
      break;
    case "weekends":
      selector["enteredAtParts.dayOfWeek"] = { $in: [0, 6] };
      break;
    case "day":
      break;
  }
  return selector;
};

Encounters.daysSelector = function (days, now) {
  var selector = {};
  if (days.inLast) {
    selector['enteredAt'] = {
      $gte: +moment(now).subtract(days.inLast, 'days')
    };
  } else {
    selector['enteredAt'] = {
      $gte: days.start,
      $lte: days.end
    };
  }
  return selector;
};
