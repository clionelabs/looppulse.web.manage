(function () {

  "use strict";

  describe("BaseEngagement", function () {
    describe("type", function () {
      it("should be equal to undefined", function () {
        var type = BaseEngagement.type;

        expect(type).toBe("recommendation");
      });
    });

  });

  describe("new BaseEngagement()", function () {
    describe("customizedContext()", function () {
      it("should return customized message and url", function () {
        var installationId = 1;
        var engagement = new BaseEngagement();
        var expectedAlertMessage = "msg";
        var expectedInAppAssetURL = "www";
        engagement.context = {
          "1": {
              "alertMessage": expectedAlertMessage,
              "inAppAssetURL": expectedInAppMessageURL
            }
        };

        var result = engagement.customizedContext(installationId);

        expect(result).toBe(engagement.context[installationId.toString()]);
      });

      it("should return undefined if not customized message for installation", function () {
        var installationId = 1;
        var engagement = new BaseEngagement();
        engagement.context = {};

        var result = engagement.customizedMessage(installationId);

        expect(result).toBeUndefined();
      });
    });

    describe("customizedEngagementContext", function () {
      it("should create context based on recommend installation ID");
      it("should return a EngagementContext");
    });

    describe("trigger()", function () {
      it("should deliver a customized engagement context", function () {
        var context = jasmine.createSpyObj("engagement context", "deliver");
        var engagement = new BaseEngagement();
        spyOn(engagement, "customizedEngagementContext").andReturn(context);

        engagement.trigger();

        expect(context.deliver).toHaveBeenCalled();
      });
    });

  });

}());
