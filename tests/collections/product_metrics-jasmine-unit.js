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
          startTime: new Date(2012,11,31,1).getTime(),
          endTime: new Date(new Date(2012,11,31,1).getTime() + ProductMetric.interval).getTime(),
          dwellTime: 0,
          visitors: [],
          }));
      })
    })

    describe("save()", function() {
      var pm;

      beforeEach(function() {
        spyOn(Metrics, "findOne").andReturn({_id : 1});
        pm = new ProductMetric({productId: 1, locationId: 1});
      });

      it("should call Metrics.upsert", function() {
        spyOn(Metrics, "upsert").andReturn({insertedId : null});
        pm.save();
        expect(Metrics.upsert).toHaveBeenCalled();
      })
      it("should call Metrics.findOne if result.insertId is not defined", function() {
        spyOn(Metrics, "upsert").andReturn({insertedId : null});
        pm.save();
        expect(Metrics.findOne).toHaveBeenCalled();
      })
      it("should not call Metrics.findOne if result.insertId is defined", function() {
        spyOn(Metrics, "upsert").andReturn({insertedId : 1});
        pm.save();
        expect(Metrics.findOne).not.toHaveBeenCalled();
      })

    })

    describe("handleEncounterAdd", function() {
      var pm, encounter;

      beforeEach(function() {
        spyOn(Date.prototype, "getTime").andReturn(123456789);
        pm = new ProductMetric({productId: 1, locationId: 1});
        encounter = jasmine.createSpy('encounter');
        encounter.visitorId = 123;
        encounter.duration = 100;
      });

      it("should add visitors", function() {
        pm.handleEncounterAdd(encounter);
        expect(pm.visitors[encounter.visitorId]).toBe(true);

      });

      it("should have only unique visitors", function() {
        pm.handleEncounterAdd(encounter);
        pm.handleEncounterAdd(encounter);
        expect(pm.getVisitorsCount()).toBe(1);
      });

      it("should add duration", function() {
        pm.handleEncounterAdd(encounter);
        expect(pm.dwellTime).toBe(encounter.duration);
      });

    })


  })

}());
