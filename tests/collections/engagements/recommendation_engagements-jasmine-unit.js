(function () {

  "use strict";

  describe("RecommendationEngagement", function () {
    describe("type", function () {
      it("should be equal to 'recommendation'", function () {
        var type = RecommendationEngagement.type;

        expect(type).toBe("recommendation");
      });
    });

  });

  describe("new RecommendationEngagement()", function () {
    it("should set type to 'recommendation'", function () {
      var engagement = new RecommendationEngagement();

      expect(engagement.type).toBe("recommendation");
    });

    describe("leavingTriggerInstallation()", function () {
      it("should return true if BeaconEvent happens within triggerInstallationIds", function () {
        var installationId = 1;
        var encounter = jasmine.createSpyObj("encounter", ["installationId"]);
        var engagement = new RecommendationEngagement();
        spyOn(_, "contains").andReturn(true);

        var result = engagement.leavingTriggerInstallation(encounter);

        expect(result).toBe(true);
        expect(_.contains).toHaveBeenCalledWith(engagement.triggerInstallationIds, encounter.installationId);
      });

      it("should return false if BeaconEvent happens outside triggerInstallationIds", function () {
        var encounter = jasmine.createSpyObj("encounter", ["installationId"]);
        var engagement = new RecommendationEngagement();

        var result = engagement.leavingTriggerInstallation(encounter);

        expect(result).toBe(false);
      });
    });

    describe("customizedMessage()", function () {
      it("should return customized message", function () {
        var installationId = 1;
        var engagement = new RecommendationEngagement();
        var expectedMessage = "msg";
        engagement.message = {"1": expectedMessage};

        var result = engagement.customizedMessage(installationId);

        expect(result).toBe(expectedMessage);
      });

      it("should return undefined if not customized message for installation", function () {
        var installationId = 1;
        var engagement = new RecommendationEngagement();
        engagement.message = {};

        var result = engagement.customizedMessage(installationId);

        expect(result).toBeUndefined();
      });
    });

    describe("readyToTrigger()", function () {
      it("should return true if ready to trigger by visit", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new RecommendationEngagement();
        spyOn(engagement, "readyToTriggerByVisit").andReturn(true);

        var result = engagement.readyToTriggerByVisit(encounter);

        expect(result).toBe(true);
        expect(engagement.readyToTriggerByVisit).toHaveBeenCalledWith(encounter);
      });

      it("should return false if nothing to trigger", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new RecommendationEngagement();
        spyOn(engagement, "readyToTriggerByVisit").andReturn(false);

        var result = engagement.readyToTriggerByVisit(encounter);

        expect(result).toBe(false);
      });
    });

    describe("readyToTriggerByVisit()", function () {
      it("should return true if within trigger installations and not visit recommend installation recently", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new RecommendationEngagement();
        spyOn(engagement, "leavingTriggerInstallation").andReturn(true);
        spyOn(engagement, "recentlyVisitedRecommendInstallation").andReturn(false);

        var result = engagement.readyToTriggerByVisit(encounter);

        expect(result).toBe(true);
        expect(engagement.leavingTriggerInstallation).toHaveBeenCalledWith(encounter);
        expect(engagement.recentlyVisitedRecommendInstallation).toHaveBeenCalledWith(encounter);
      });

      it("should return false if visit recommend installation recently", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new RecommendationEngagement();
        spyOn(engagement, "leavingTriggerInstallation").andReturn(true);
        spyOn(engagement, "recentlyVisitedRecommendInstallation").andReturn(true);

        var result = engagement.readyToTriggerByVisit(encounter);

        expect(result).toBe(false);
        expect(engagement.recentlyVisitedRecommendInstallation).toHaveBeenCalledWith(encounter);
      });

      it("should return false if outside trigger installations", function () {
        var encounter = jasmine.createSpy("encounter");
        var engagement = new RecommendationEngagement();
        spyOn(engagement, "leavingTriggerInstallation").andReturn(false);

        var result = engagement.readyToTriggerByVisit(encounter);

        expect(result).toBe(false);
        expect(engagement.leavingTriggerInstallation).toHaveBeenCalledWith(encounter);
      });
    });

    describe("recentlyVisitedRecommendInstallation()", function () {
      it("should return true if having recent Encounter", function () {
        var encounter = jasmine.createSpyObj("encounter", ["enteredAt", "visitorId"]);
        var expectedGt = 1;
        encounter.enteredAt = 3600 * 1000 + expectedGt;
        spyOn(Encounters, "findOne").andReturn(encounter);
        var engagement = new RecommendationEngagement();
        engagement.recommendInstallationIds = jasmine.createSpy("recommendInstallationIds");

        var result = engagement.recentlyVisitedRecommendInstallation(encounter);

        expect(result).toBe(true);
        expect(Encounters.findOne).toHaveBeenCalledWith({
          visitorId: encounter.visitorId,
          enteredAt: {
            $gt: expectedGt,
            $lt: encounter.enteredAt
          },
          installationId: { $in: engagement.recommendInstallationIds }
        });
      });

      it("should return false if no recent Encounter", function () {
        spyOn(Encounters, "findOne").andReturn(null);
        var encounter = jasmine.createSpyObj("encounter", ["enteredAt", "visitorId"]);
        var engagement = new RecommendationEngagement();

        var result = engagement.recentlyVisitedRecommendInstallation(encounter);

        expect(result).toBe(false);
        expect(Encounters.findOne).toHaveBeenCalled();
      });
    });

    describe("trigger()", function () {
      it("should call customizedMessage with recommended installation Ids", function () {
        spyOn(Message, "deliver");
        var encounter = jasmine.createSpyObj("encounter", ["visitorId"]);
        var engagement = new RecommendationEngagement();
        spyOn(engagement, "customizedMessage");
        var expectedInstallationId = jasmine.createSpy("aInstallationId");
        spyOn(Random, "choice").andReturn(expectedInstallationId);
        engagement.recommendInstallationIds = [expectedInstallationId];

        engagement.trigger(encounter);

        expect(Random.choice).toHaveBeenCalledWith([expectedInstallationId]);
        expect(engagement.customizedMessage).toHaveBeenCalledWith(expectedInstallationId);
      });

      it("should deliver Message", function () {
        spyOn(Message, "deliver");
        var encounter = jasmine.createSpyObj("encounter", ["visitorId"]);
        var engagement = new RecommendationEngagement();
        engagement._id = 1;
        var customizedMessage = "aCustomizedMessage";
        spyOn(engagement, "customizedMessage").andReturn(customizedMessage);

        engagement.trigger(encounter);

        expect(engagement.customizedMessage).toHaveBeenCalled();
        expect(Message.deliver).toHaveBeenCalledWith(encounter.visitorId, customizedMessage, engagement._id);
      });
    });

  });

}());
