(function () {

  "use strict";

  describe("Encounter", function () {

    describe("createOrUpdate()", function () {

      it("should do nothing when installation is missing", function () {
        spyOn(Installations, "findOne").andReturn(null);
        var beaconEvent = jasmine.createSpyObj("beaconEvent", ["beaconId"]);

        var encounterId = Encounter.createOrUpdate(beaconEvent);

        expect(Installations.findOne).toHaveBeenCalledWith({beaconId: beaconEvent.beaconId});
        expect(encounterId).toBeUndefined();
      });

      it("should do nothing for non-enter and non-exit BeaconEvent", function () {
        spyOn(Installations, "findOne").andReturn({ _id: 1 });
        spyOn(Encounter.prototype, "save");
        var beaconEvent = jasmine.createSpyObj("beaconEvent", ["beaconId"]);
        beaconEvent.isEnter = function () { return false; };
        beaconEvent.isExit = function () { return false; };

        var encounterId = Encounter.createOrUpdate(beaconEvent);

        expect(Encounter.prototype.save).not.toHaveBeenCalled();
        expect(encounterId).toBeUndefined();
      });

      it("should create Encounter for 'enter' BeaconEvent", function () {
        spyOn(Installations, "findOne").andReturn({ _id: 1 });
        var expectedEncounterId = 2;
        spyOn(Encounter.prototype, "save").andReturn(expectedEncounterId);
        var beaconEvent = jasmine.createSpyObj("beaconEvent", ["createdAt"]);
        beaconEvent.isEnter = function () { return true; };
        beaconEvent.isExit = function () { return false; };

        var encounterId = Encounter.createOrUpdate(beaconEvent);

        expect(Encounter.prototype.save).toHaveBeenCalled();
        expect(encounterId).toBe(expectedEncounterId);
      });

      it("should update Encounter for 'exit' BeaconEvent", function () {
        spyOn(Installations, "findOne").andReturn({ _id: 1 });
        var expectedEncounter = jasmine.createSpyObj("encounter", ["_id", "close", "save"]);
        expectedEncounter.save.andReturn(expectedEncounter._id);
        spyOn(Encounters, "findOne").andReturn(expectedEncounter);
        var beaconEvent = jasmine.createSpyObj("beaconEvent", ["createdAt"]);
        beaconEvent.isEnter = function () { return false; };
        beaconEvent.isExit = function () { return true; };
        // TODO the following preparations should not be needed after Metric.update() moved
        spyOn(Location, "load");
        spyOn(Metric, "update");

        var encounterId = Encounter.createOrUpdate(beaconEvent);

        expect(Encounters.findOne).toHaveBeenCalled();
        expect(expectedEncounter.close).toHaveBeenCalledWith(beaconEvent.createdAt);
        expect(expectedEncounter.save).toHaveBeenCalled();
        expect(encounterId).toBe(expectedEncounter._id);
      });

    });

    describe("ensureIndex()", function () {
      it("should call Meteor.Collection._ensureIndex", function () {
        spyOn(Encounters, "_ensureIndex");

        Encounter.ensureIndex();

        expect(Encounters._ensureIndex).toHaveBeenCalled();
      });
    });

    describe("findClosed()", function () {
      it("should return a cursor", function () {
        var fakeCursor = "fakeCursor";
        spyOn(Encounters, "find").andReturn(fakeCursor);

        var result = Encounter.findClosed();

        expect(result).toBe(fakeCursor);
        expect(Encounters.find).toHaveBeenCalledWith({"exitedAt": {"$exists": true}});
      });
    });

    describe("findLastOpen()", function () {
      var beaconEvent;
      var installation;

      beforeEach(function () {
        beaconEvent = jasmine.createSpyObj("beaconEvent", ["visitorId", "createdAt"]);
        installation = jasmine.createSpyObj("installation", ["_id"]);
      });

      it("should find an Encounter", function () {
        var expectedEncounter = "expectedEncounter";
        spyOn(Encounters, "findOne").andReturn(expectedEncounter);

        var result = Encounter.findLastOpen(beaconEvent, installation);

        expect(result).toBe(expectedEncounter);
      });

      it("should find with correct filters", function () {
        spyOn(Encounters, "findOne");

        Encounter.findLastOpen(beaconEvent, installation);

        expect(Encounters.findOne).toHaveBeenCalledWith({
          visitorId: beaconEvent.visitorId,
          installationId: installation._id,
          enteredAt: {$lt: beaconEvent.createdAt},
          exitedAt: {"$exists": false}
        }, jasmine.any(Object));
      });

      it("should find with descending enteredAt", function () {
        spyOn(Encounters, "findOne");

        Encounter.findLastOpen(beaconEvent, installation);

        expect(Encounters.findOne).toHaveBeenCalledWith(jasmine.any(Object), {sort: {enteredAt: -1}});
      });
    });

    describe("startup()", function () {
      it("should observe added BeaconEvent", function () {
        var beaconEvents = jasmine.createSpyObj("beaconEvents", ["observe"]);
        spyOn(BeaconEvents, "find").andReturn(beaconEvents);

        Encounter.startup();

        expect(beaconEvents.observe).toHaveBeenCalledWith({ "added": jasmine.any(Function) });
      });
    });

  });

  describe("new Encounter()", function () {

    it("should set properties from arguments", function () {
      spyOn(Encounter.prototype, "close");

      var encounter = new Encounter("aVisitorId", "aInstallationId", "enteredAt");

      expect(encounter.visitorId).toBe("aVisitorId");
      expect(encounter.installationId).toBe("aInstallationId");
      expect(encounter.enteredAt).toBe("enteredAt");
      expect(encounter.close).not.toHaveBeenCalled();
    });

    describe("close()", function () {
      it("should set exitedAt", function () {
        var expectedExitedAt = 3;
        var encounter = new Encounter("aVisitorId", "aInstallationId", "enteredAt");

        encounter.close(expectedExitedAt);

        expect(encounter.exitedAt).toBe(expectedExitedAt);
      });

      it("should set duration", function () {
        var enteredAt = 1;
        var exitedAt = 3;
        var expectedDuration = exitedAt - enteredAt;
        var encounter = new Encounter("aVisitorId", "aInstallationId", enteredAt);

        encounter.close(exitedAt);

        expect(encounter.duration).toBe(expectedDuration);
      });
    });

    describe("isClosed()", function () {
      it("should return true if exitedAt is set", function () {
        var encounter = new Encounter("aVisitorId", "aInstallationId", "enteredAt");
        encounter.exitedAt = 1;

        var isClosed = encounter.isClosed();

        expect(isClosed).toBe(true);
      });

      it("should return false if exitedAt is not set", function () {
        var encounter = new Encounter("aVisitorId", "aInstallationId", null);

        var isClosed = encounter.isClosed();

        expect(isClosed).toBe(false);
      });
    });

    describe("save()", function () {
      it("should set _id and return it", function () {
        spyOn(Encounters, "upsert").andReturn({});
        var expectedId = 1;
        spyOn(Encounters, "findOne").andReturn({ _id: expectedId});
        spyOn(Encounter.prototype, "close");
        var encounter = new Encounter("aVisitorId", "aBeaconId", { type: "t1" });

        var encounterId = encounter.save();

        // TODO test more details
        expect(Encounters.upsert).toHaveBeenCalled();
        expect(encounter._id).toBe(expectedId);
        expect(encounterId).toBe(expectedId);
      });
    });

  });

}());
