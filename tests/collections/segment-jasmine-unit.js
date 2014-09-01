(function() {

  "use strict";

  describe("new Segment()", function() {
    describe("match()", function() {
      it("should return false if rules is undefined", function() {
        var segment = new Segment({});

        var result = segment.match();

        expect(result).toBe(false);
      });

      it("should return false if rules is empty array", function() {
        var segment = new Segment({ rules: [] });

        var result = segment.match();

        expect(result).toBe(false);
      });

      it("should return true if \"visitors\" in rules", function() {
        var segment = new Segment({ rules: ["visitors"] });

        var result = segment.match();

        expect(result).toBe(true);
      });
    });
  });

}());
