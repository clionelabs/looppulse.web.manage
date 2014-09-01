(function() {

  "use strict";

  describe("new Segment()", function() {
    describe("match()", function() {
      it("should return false if rules is undefined", function() {
        var encounter =jasmine.createSpy('encounter');
        var segment = new Segment({});

        var result = segment.match(encounter);

        expect(result).toBe(false);
      });

      it("should return false if rules is empty array", function() {
        var encounter =jasmine.createSpy('encounter');
        var segment = new Segment({ rules: [] });

        var result = segment.match(encounter);

        expect(result).toBe(false);
      });

      it("should return true if \"visitors\" in rules", function() {
        var encounter =jasmine.createSpy('encounter');
        var segment = new Segment({ rules: ["visitors"] });

        var result = segment.match(encounter);

        expect(result).toBe(true);
      });
    });
  });

}());
