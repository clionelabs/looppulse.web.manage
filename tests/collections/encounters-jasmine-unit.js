(function () {

  "use strict";

  describe("Encounter", function () {

    describe("ensureIndex()", function () {
      it("should call Meteor.Collection._ensureIndex", function () {
        spyOn(Encounters, "_ensureIndex");

        Encounter.ensureIndex();

        expect(Encounters._ensureIndex).toHaveBeenCalled();
      });
    });

  });

  describe("new Encounter()", function () {

    it("should set properties from arguments", function () {
      spyOn(Encounter.prototype, "close");

      var encounter = new Encounter("aVisitorId", "aInstallationId", "exitedAt");

      expect(encounter.visitorId).toBe("aVisitorId");
      expect(encounter.installationId).toBe("aInstallationId");
      expect(encounter.exitedAt).toBe("exitedAt");
      expect(encounter.close).toHaveBeenCalled();
    });

    describe("close()", function () {
      it("should set enteredAt from entryEvent", function () {
        var expectedEnteredAt = 1;
        spyOn(Encounter.prototype, "entryEvent").andReturn({ createdAt: expectedEnteredAt });
        var encounter = new Encounter("aVisitorId", "aInstallationId", "exitedAt");

        encounter.close();

        expect(encounter.enteredAt).toBe(expectedEnteredAt);
        expect(encounter.entryEvent).toHaveBeenCalled();
      });

      it("should set duration", function () {
        spyOn(Encounter.prototype, "entryEvent").andReturn({ createdAt: 2 });
        var encounter = new Encounter("aVisitorId", "aInstallationId", "exitedAt");
        encounter.exitedAt = 3;

        encounter.close();

        expect(encounter.duration).toBe(1);
      });
    });

    describe("entryEvent()", function () {

      it("should return fake entry event", function () {
        spyOn(Installations, "findOne").andReturn({ beaconId: "b1" });
        var expectedCreatedAt = "exitedAt";
        var encounter = new Encounter("aVisitorId", "aInstallationId", expectedCreatedAt);

        var entryEvent = encounter.entryEvent();

        expect(entryEvent).toEqual({ createdAt: expectedCreatedAt });
      });

      it("should return first non-exist event", function () {
        spyOn(Installations, "findOne").andReturn({ beaconId: "b1" });
        var expectedEntryEvent = {};
        spyOn(BeaconEvents, "findOne").andReturn(expectedEntryEvent);
        var encounter = new Encounter("aVisitorId", "aInstallationId", "exitedAt");

        var entryEvent = encounter.entryEvent();

        expect(entryEvent).toBe(expectedEntryEvent);
      });

      // TODO add more test cases
    });

    describe("save()", function () {
      it("should set _id and return it", function () {
        spyOn(Encounters, "upsert");
        var expectedId = 1;
        spyOn(Encounters, "findOne").andReturn({ _id: expectedId});
        spyOn(Encounter.prototype, "close");

        var encounter = new Encounter("aVisitorId", "aBeaconId", { type: "t1" });
        var encounterId = encounter.save();

        expect(Encounters.upsert).toHaveBeenCalledWith(encounter, encounter);
        expect(encounter._id).toBe(expectedId);
        expect(encounterId).toBe(expectedId);
      });
    });

  });

}());
