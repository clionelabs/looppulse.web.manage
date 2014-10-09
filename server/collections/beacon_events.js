BeaconEvent.ensureIndex = function () {
  BeaconEvents._ensureIndex({
    visitorId: 1,
    beaconId: 1,
    sessionId: 1,
    type: 1,
    createdAt: 1
  });
};
