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

  });

}());
