(function() {

  "use strict";

  describe("ProductMetrics", function() {
    describe("init", function() {
      
      it("should create ProductMetrics with proper data", function() { 
        spyOn(Date.prototype, "getFullYear").andReturn(2012);
        spyOn(Date.prototype, "getMonth").andReturn(11);
        spyOn(Date.prototype, "getDate").andReturn(31);
        spyOn(Date.prototype, "getHours").andReturn(1);

        var pm = new ProductMetric({productId: 1, locationId: 1});
        
        expect(pm).toEqual(jasmine.objectContaining({
          productId: 1,
          locationId: 1,
          startTime: new Date(2012,11,31,1),
          endTime: new Date(new Date(2012,11,31,1).getTime() + ProductMetric.interval),
          dwellTime: 0,
          visitors: {},
          }));
      })
    })
  })

}());
