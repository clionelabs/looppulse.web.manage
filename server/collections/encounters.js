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
    exitedAt: 1
  });
};

Encounter.startup = function () {
  BeaconEvents.find().observe({
    _suppress_initial: true,
    "added": function (beaconEvent) {
      Encounters.createOrUpdate(beaconEvent);
    }
  });
  console.info("[Encounter] startup complete");
};
