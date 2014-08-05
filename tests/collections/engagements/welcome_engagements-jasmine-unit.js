(function () {

  "use strict";

  describe("WelcomeEngagement", function () {
    describe("type", function () {
      it("should be equal to 'welcome'", function () {
        var type = WelcomeEngagement.type;

        expect(type).toBe("welcome");
      });
    });
  });

  describe("new WelcomeEngagement()", function () {

    describe("atTriggerInstallation()", function () {
      it("should return true if Encounter happens within triggerInstallationIds", function () {
        var installationId = 1;
        var encounter = jasmine.createSpyObj("encounter", ["installationId"]);
        var engagement = new WelcomeEngagement();
        spyOn(_, "contains").andReturn(true);

        var result = engagement.atTriggerInstallation(encounter);

        expect(result).toBe(true);
        expect(_.contains).toHaveBeenCalledWith(engagement.triggerInstallationIds, encounter.installationId);
      });

      it("should return false if Encounter happens outside triggerInstallationIds", function () {
        var encounter = jasmine.createSpyObj("encounter", ["installationId"]);
        var engagement = new WelcomeEngagement();

        var result = engagement.atTriggerInstallation(encounter);

        expect(result).toBe(false);
      });
    });

    describe("readyToTrigger()", function () {
      it("should return true if at non-recently visited trigger installation", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new WelcomeEngagement();
        spyOn(engagement, "atTriggerInstallation").andReturn(true);
        spyOn(engagement, "recentlyVisitedTriggerInstallation").andReturn(false);

        var result = engagement.readyToTrigger(encounter);

        expect(result).toBe(true);
        expect(engagement.atTriggerInstallation).toHaveBeenCalled();
        expect(engagement.recentlyVisitedTriggerInstallation).toHaveBeenCalled();
      });

      it("should return false if not at trigger installation", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new WelcomeEngagement();
        spyOn(engagement, "atTriggerInstallation").andReturn(false);

        var result = engagement.readyToTrigger(encounter);

        expect(result).toBe(false);
        expect(engagement.atTriggerInstallation).toHaveBeenCalled();
      });

      it("should return false if visited trigger installation recently", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new WelcomeEngagement();
        spyOn(engagement, "atTriggerInstallation").andReturn(true);
        spyOn(engagement, "recentlyVisitedTriggerInstallation").andReturn(true);

        var result = engagement.readyToTrigger(encounter);

        expect(result).toBe(false);
        expect(engagement.recentlyVisitedTriggerInstallation).toHaveBeenCalled();
      });
    });

    describe("recentlyVisitedTriggerInstallation()", function () {
      it("should return true if having recent Encounter", function () {
        var encounter = jasmine.createSpyObj("encounter", ["enteredAt", "visitorId"]);
        encounter.findPrevious = Encounter.prototype.findPrevious;
        spyOn(Encounters, "findOne").andReturn(encounter);
        var engagement = new WelcomeEngagement();

        var result = engagement.recentlyVisitedTriggerInstallation(encounter);

        expect(result).toBe(true);
        expect(Encounters.findOne).toHaveBeenCalled();
      });

      it("should return false if no recent Encounter", function () {
        spyOn(Encounters, "findOne").andReturn(null);
        var encounter = jasmine.createSpyObj("encounter", ["enteredAt", "visitorId"]);
        encounter.findPrevious = Encounter.prototype.findPrevious;
        var engagement = new WelcomeEngagement();

        var result = engagement.recentlyVisitedTriggerInstallation(encounter);

        expect(result).toBe(false);
        expect(Encounters.findOne).toHaveBeenCalled();
      });
    });

    describe("trigger()", function () {
      it("should deliver Message", function () {
        spyOn(Message, "deliver");
        var encounter = jasmine.createSpyObj("encounter", ["visitorId"]);
        var engagement = new WelcomeEngagement();
        engagement._id = 1;
        engagement.message = "aMessage";

        engagement.trigger(encounter);

        expect(Message.deliver).toHaveBeenCalledWith(encounter.visitorId, engagement.message, engagement._id);
      });
    });

  });

}());
