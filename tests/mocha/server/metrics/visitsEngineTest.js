if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){

    describe("Simple", function() {
      var baseDate = moment('2014-01-01 00:00:00.000');
      var getBaseDate = function() {
        return moment(baseDate);
      };
      var baseWeekday = getBaseDate().day();
      var engine;
      chai.config.truncateThreshold = 0;

      beforeEach(function() {
        var periodFrom = getBaseDate();
        var periodTo = getBaseDate().add(1, 'month');
        engine = new VisitsEngine(periodFrom, periodTo, 'd');
        var encounters = [
            {visitorId: 1, enteredAt: getBaseDate().add(0, 'd').add(10, 's'), exitedAt: getBaseDate().add(0, 'd').add(10, 's'), duration: 10*1000},
            {visitorId: 1, enteredAt: getBaseDate().add(0, 'd').add(50, 's'), exitedAt: getBaseDate().add(0, 'd').add(60, 's'), duration: 10*1000},
            {visitorId: 1, enteredAt: getBaseDate().add(1, 'd').add(10, 's'), exitedAt: getBaseDate().add(1, 'd').add(20, 's'), duration: 10*1000},
            {visitorId: 2, enteredAt: getBaseDate().add(0, 'd').add(10, 's'), exitedAt: getBaseDate().add(0, 'd').add(20, 's'), duration: 10*1000}
        ];
        var visitorIds = [1, 2];
        engine.build(visitorIds, encounters);
      });

      it("build()", function() {
        var expected = {
          1: {
               0: {enteredAt: getBaseDate().add(0, 'd').add(10, 's'), exitedAt: getBaseDate().add(0, 'd').add(60, 's'), duration: 20 * 1000},
               1: {enteredAt: getBaseDate().add(1, 'd').add(10, 's'), exitedAt: getBaseDate().add(1, 'd').add(20, 's'), duration: 10 * 1000} 
          },
          2: {
               0: {enteredAt: getBaseDate().add(0, 'd').add(10, 's'), exitedAt: getBaseDate().add(0, 'd').add(20, 's'), duration: 10 * 1000} 
          }
        };
        chai.expect(engine.data).to.deep.equal(expected);
      });

      it("queryAverageDuration()", function() {
        var avg = engine.queryAverageDuration();
        chai.expect(avg).equal(12.5 * 1000);
      });

      it("queryRepeatedVisitorsCount()", function() {
        var cnt = engine.queryRepeatedVisitorsCount();
        chai.expect(cnt).equal(1);
      });

      it("queryTotalVisitsCount()", function() {
        var cnt = engine.queryTotalVisitsCount();
        chai.expect(cnt).equal(3);
      });

      it("queryAverageDurationWeeklyHourlySeries()", function() {
        var series = engine.queryAverageDurationWeeklyHourlySeries('ENTER');
        var expected = engine.constructZero2DArray(7, 24);
        expected[baseWeekday][0] = 15 * 1000;
        expected[(baseWeekday + 1) % 7][0] = 10 * 1000;
        chai.expect(series).to.deep.equal(expected);
      });

      it("queryVisitsCountWeeklyHourlySeries()", function() {
        var series = engine.queryVisitsCountWeeklyHourlySeries('ENTER');
        var expected = engine.constructZero2DArray(7, 24);
        expected[baseWeekday][0] = 2;
        expected[(baseWeekday + 1) % 7][0] = 1;
        chai.expect(series).to.deep.equal(expected);
      });

      it("queryVisitorCountsXDurationIntervalSeries()", function() {
        var series = engine.queryVisitorCountsXDurationIntervalSeries(11 * 1000);
        var expected = [1, 1]; // v1: 12.5 secs, v2: 10 secs
        chai.expect(series).to.deep.equal(expected);
      });

      it("queryVisitorCountsXVisitsSeries()", function() {
        var series = engine.queryVisitorCountsXVisitsSeries();
        chai.expect(series).to.deep.equal([0, 1, 1]);
      });

      it("queryVisitorsCountXBucketSeries()", function() {
        var series = engine.queryVisitorsCountXBucketSeries();
        var len = engine.periodTo.diff(engine.periodFrom, 'd'); 
        var expected = [];
        for (var i = 0; i < len; i++) {
          expected[i] = 0;
        }
        expected[0] = 2;
        expected[1] = 1;
        chai.expect(series).to.deep.equal(expected);
      });
    });
  });
}
