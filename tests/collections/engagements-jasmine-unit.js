(function () {

  "use strict";

  describe("Engagement", function () {

    describe("availableEngagements()", function () {
      it("should return available engagements of a location ID", function () {
        var expectedAvailableEngagements = {};
        spyOn(Engagements, 'find').andReturn(expectedAvailableEngagements);

        var availableEngagements = Engagement.availableEngagements('aLocationId');

        expect(Engagements.find).toHaveBeenCalledWith({ locationId: 'aLocationId' });
        expect(availableEngagements).toEqual(expectedAvailableEngagements);
      });
    });

    describe("dispatch()", function () {
      it("should not trigger encounter when not ready", function () {
        spyOn(Installations, 'findOne').andReturn({ localtionId: 'aLocationId' });
        var fakeEngagement = jasmine.createSpyObj('engagement', ['readyToTrigger', 'trigger']);
        spyOn(Engagement, 'availableEngagements').andReturn([fakeEngagement]);
        var expectedEncounter = {};

        Engagement.dispatch(expectedEncounter);

        expect(fakeEngagement.readyToTrigger).toHaveBeenCalledWith(expectedEncounter);
        expect(fakeEngagement.trigger).not.toHaveBeenCalled();
      });

      it("should trigger encounter", function () {
        spyOn(Installations, 'findOne').andReturn({ localtionId: 'aLocationId' });
        var fakeEngagement = jasmine.createSpyObj('engagement', ['readyToTrigger', 'trigger']);
        fakeEngagement.readyToTrigger.andReturn(true);
        spyOn(Engagement, 'availableEngagements').andReturn([fakeEngagement]);
        var expectedEncounter = {};

        Engagement.dispatch(expectedEncounter);

        expect(fakeEngagement.readyToTrigger).toHaveBeenCalledWith(expectedEncounter);
        expect(fakeEngagement.trigger).toHaveBeenCalledWith(expectedEncounter);
      });
    });

  });

}());
