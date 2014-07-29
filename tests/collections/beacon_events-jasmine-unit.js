(function () {

  "use strict";

  describe("BeaconEvent", function () {

    describe("ensureIndex()", function () {
      it("should call Meteor.Collection._ensureIndex", function () {
        spyOn(BeaconEvents, "_ensureIndex");

        BeaconEvent.ensureIndex();

        expect(BeaconEvents._ensureIndex).toHaveBeenCalled();
      });
    });

    describe("entryType()", function () {
      it("should return 'didEnterRegion'", function () {
        expect(BeaconEvent.entryType()).toBe("didEnterRegion");
      });
    });

    describe("rangingType()", function () {
      it("should return 'didRangeBeacons'", function () {
        expect(BeaconEvent.rangingType()).toBe("didRangeBeacons");
      });
    });

    describe("exitType()", function () {
      it("should return 'didExitRegion'", function () {
        expect(BeaconEvent.exitType()).toBe("didExitRegion");
      });
    });

  });  // BeaconEvent

  describe("new BeaconEvent()", function () {

    describe("proximity", function () {
      it("should be set when provided for rangingType", function () {
        var expectedProximity = "p1";
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didRangeBeacons", proximity: expectedProximity });

        expect(beaconEvent.proximity).toBe(expectedProximity);
      });

      it("should not be set when provided for non-rangingType", function () {
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didEnterRegion", proximity: "p1" });
        expect(beaconEvent.proximity).toBeUndefined();

        beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didExitRegion", proximity: "p1" });
        expect(beaconEvent.proximity).toBeUndefined();
      });
    });

    describe("isEnter()", function () {
      it("should return true for didEnterRegion type", function () {
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didEnterRegion", proximity: "p1" });

        expect(beaconEvent.isEnter()).toBe(true);
      });

      it("should return false for non-didEnterRegion type", function () {
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didRangeBeacons", proximity: "p1" });

        expect(beaconEvent.isEnter()).toBe(false);
      });
    });

    describe("save()", function () {
      it("should do nothing for unknown proximity", function () {
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "t1" });

        beaconEvent.proximity = "unknown";

        expect(beaconEvent.save()).toBe(undefined);
      });

      it("should return ID after save", function () {
        spyOn(BeaconEvents, "upsert").andReturn({});
        var expectedId = 1;
        spyOn(BeaconEvents, "findOne").andReturn({ _id: expectedId});
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "t1" });

        var beaconEventId = beaconEvent.save();

        // TODO test more details
        expect(BeaconEvents.upsert).toHaveBeenCalled();
        expect(beaconEvent._id).toBe(expectedId);
        expect(beaconEventId).toBe(expectedId);
      });
    });

    describe("warnAboutUnknownProximity()", function () {

      it("should return false when missing proximity", function () {
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "t1" });

        expect(beaconEvent.warnAboutUnknownProximity()).toBe(false);
      });

      it("should return true when proximity equals to 'unknown'", function () {
        var beaconEvent = new BeaconEvent("aVisitorId", "aBeaconId", { type: "t1" });

        beaconEvent.proximity = "unknown";

        expect(beaconEvent.warnAboutUnknownProximity()).toBe(true);
      });

    });

  });  // new BeaconEvent()

}());
