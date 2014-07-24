(function () {

  "use strict";


  describe("Encounter", function () {

    it("should set properties from arguments", function () {
      spyOn(Encounter.prototype, 'close');

      var encounter = new Encounter('aVisitorId', 'aInstallationId', 'exitedAt');

      expect(encounter.visitorId).toBe('aVisitorId');
      expect(encounter.installationId).toBe('aInstallationId');
      expect(encounter.exitedAt).toBe('exitedAt');
      expect(encounter.close).toHaveBeenCalled();
    });

  });

}());
