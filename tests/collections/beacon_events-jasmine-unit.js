(function () {

  "use strict";

  describe("BeaconEvent", function () {
    beforeEach(function () {
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
        var beacon_event = new BeaconEvent('aVisitorId', 'aBeaconId', {
          type: 't1'
        });
        expect(beacon_event.warnAboutUnknownProximity()).toBe(false);
      });

    });

  });

}());
