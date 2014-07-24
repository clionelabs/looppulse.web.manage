(function () {

  "use strict";

  describe("BeaconEvent", function () {
    beforeEach(function () {
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
