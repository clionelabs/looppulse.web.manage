(function () {

  "use strict";

  describe("BeaconEvent", function () {
    beforeEach(function () {
    });

    describe("proximity", function () {
      it("should be set when provided for rangingType", function () {
        var expectedProximity = 'p1';
        var beacon_event = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didRangeBeacons", proximity: expectedProximity });
        expect(beacon_event.proximity).toBe(expectedProximity);
      });

      it("should not be set when provided for non-rangingType", function () {
        var beacon_event = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didEnterRegion", proximity: 'p1' });
        expect(beacon_event.proximity).toBe(undefined);

        var beacon_event = new BeaconEvent("aVisitorId", "aBeaconId", { type: "didExitRegion", proximity: 'p1' });
        expect(beacon_event.proximity).toBe(undefined);
      });
    });

    describe("entryType", function () {
      it("should return 'didEnterRegion'", function () {
        expect(BeaconEvent.entryType()).toBe("didEnterRegion");
      });
    });

    describe("rangingType", function () {
      it("should return 'didRangeBeacons'", function () {
        expect(BeaconEvent.rangingType()).toBe("didRangeBeacons");
      });
    });

    describe("exitType", function () {
      it("should return 'didExitRegion'", function () {
        expect(BeaconEvent.exitType()).toBe("didExitRegion");
      });
    });

    describe("warnAboutUnknownProximity", function () {

      it("should return false when missing proximity", function () {
        var beacon_event = new BeaconEvent('aVisitorId', 'aBeaconId', { type: 't1' });
        expect(beacon_event.warnAboutUnknownProximity()).toBe(false);
      });

      it("should return true when proximity equals to 'unknown'", function () {
        var beacon_event = new BeaconEvent('aVisitorId', 'aBeaconId', { type: 't1' });
        beacon_event.proximity = "unknown";
        expect(beacon_event.warnAboutUnknownProximity()).toBe(true);
      });

    });

    describe("save", function () {
      it("should do nothing for unknown proximity", function () {
        var beacon_event = new BeaconEvent('aVisitorId', 'aBeaconId', { type: 't1' });
        beacon_event.proximity = "unknown";
        expect(beacon_event.save()).toBe(undefined);
      });

      it("should return ID after save", function () {
        // TODO fix upsert does not exists in test
        if (!(typeof BeaconEvents.upsert === 'undefined')) {
          spyOn(BeaconEvents, 'upsert');
        } else {
          BeaconEvents.upsert = jasmine.createSpy('upsert');
        }

        var expectedId = 1;
        spyOn(BeaconEvents, 'findOne').andReturn({ _id: expectedId});

        var beacon_event = new BeaconEvent('aVisitorId', 'aBeaconId', { type: 't1' });
        beacon_event.save();

        expect(BeaconEvents.upsert).toHaveBeenCalledWith(beacon_event, beacon_event);
        expect(beacon_event._id).toBe(expectedId);
      });
    });

  });

}());
