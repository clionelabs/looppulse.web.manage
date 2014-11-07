if (!(typeof MochaWeb === "undefined")) {
    MochaWeb.testOnly(function() {

        describe("Prepare Graph", function() {
           var baseDate = moment().day(-7).hour(0).minute(0).second(0); // set base day as last sunday 00:00:00
            var getDateFromBase = function(amount, unit) {
                return moment(baseDate).add(amount, unit);
            }

            describe("prepareNumOfVisitorXTimeBucketistogramData", function() { 
                it ("Sample Case", function() {
                    var encounters = [
                        {visitorId: 1, enteredAt: getDateFromBase(1, 'w')},
                        {visitorId: 1, enteredAt: getDateFromBase(1, 'w')},
                        {visitorId: 2, enteredAt: getDateFromBase(1, 'w')},
                        {visitorId: 1, enteredAt: getDateFromBase(3, 'w')}
                    ];
                    var result = SegmentMetric.prepareNumOfVisitorXTimeBucketLineChartData(getDateFromBase(0, 'w').valueOf(), getDateFromBase(5, 'w').valueOf(), SegmentMetric.TimeBucket.Week, encounters); 
                    chai.expect(result).to.deep.equal([0, 2, 0, 1, 0]);
                });
            });

            describe("prepareAverageDwelTimeBucketXNumOfVisitorHistogramData", function() {
                it ("Sample Case", function() {
                    var encounters = [
                        {visitorId: 1, enteredAt: getDateFromBase(1, 'd'), duration: 1 * 1000}, // visitor 1: average = (1000 + 999) / 1 (because same day)
                        {visitorId: 1, enteredAt: getDateFromBase(1, 'd'), duration: 1 * 999},
                        {visitorId: 2, enteredAt: getDateFromBase(1, 'd'), duration: 3 * 1000}, // visitor 2: average = 3000 / 1
                        {visitorId: 3, enteredAt: getDateFromBase(1, 'd'), duration: 5 * 1000}, // visitor 3: average = (5000 + 6000) / 2
                        {visitorId: 3, enteredAt: getDateFromBase(2, 'd'), duration: 6 * 1000} 
                    ]
                    var result = SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData(encounters, 1 * 1000);
                    chai.expect(result).to.deep.equal([0, 1, 0, 1, 0, 1]);
                });
            });

            describe("prepareDwellTimeInTimeFrameBubbleData", function() {
                it ("Sample Case", function() {
                    var baseDay = getDateFromBase(0, 's').day();
                    var baseHour = getDateFromBase(0, 's').hour();
                    var startDate = getDateFromBase(0, 's').subtract(baseDay, 'd').subtract(baseHour, 'h');
                    var encounters = [
                        {visitorId: 1, enteredAt: moment(startDate).add(0, 'd').add(4, 'h'), duration: 1 * 1000},
                        {visitorId: 1, enteredAt: moment(startDate).add(1, 'd'), duration: 2 * 1000},
                        {visitorId: 2, enteredAt: moment(startDate).add(1, 'd'), duration: 3 * 1000},
                        {visitorId: 1, enteredAt: moment(startDate).add(6, 'd').add(23, 'h'), duration: 4 * 1000}
                    ];
                    var expected = SegmentMetric.createEmptyBubbleArray();
                    expected[0][4] = 1000;
                    expected[1][0] = 2500;
                    expected[6][23] = 4000;
                    var result = SegmentMetric.prepareDwellTimeInTimeFrameBubbleData(encounters);
                    chai.expect(result).to.deep.equal(expected);
                });
            });

            describe("SegmentMetric.prepareNumberOfVisitorsXNumberOfVisitsHistogramData", function() {
                it ("Sample Case", function() {
                    var encounters = [
                        {visitorId: 1, enteredAt: getDateFromBase(1, 'd')}, // visitor 1: count = 2 
                        {visitorId: 1, enteredAt: getDateFromBase(2, 'd')},
                        {visitorId: 2, enteredAt: getDateFromBase(1, 'd')}, // visitor 2: count = 1
                        {visitorId: 3, enteredAt: getDateFromBase(1, 'd')}, // visitor 3: count = 1 because same day
                        {visitorId: 3, enteredAt: getDateFromBase(1, 'd')} 
                    ];
                    var result = SegmentMetric.prepareNumberOfVisitorsXNumberOfVisitsHistogramData(encounters, 1);
                    chai.expect(result).to.deep.equal([0, 2, 1]);
                });
            });

            describe("prepareNumberOfVisitsInTimeFrameBubbleData", function() {
                it ("Sample Case", function() {
                    var baseDay = getDateFromBase(0, 's').day();
                    var baseHour = getDateFromBase(0, 's').hour();
                    var startDate = getDateFromBase(0, 's').subtract(baseDay, 'd').subtract(baseHour, 'h');
                    var encounters = [
                        {visitorId: 1, enteredAt: moment(startDate).add(0, 'd').add(4, 'h')},
                        {visitorId: 1, enteredAt: moment(startDate).add(1, 'd')},
                        {visitorId: 2, enteredAt: moment(startDate).add(1, 'd')},
                        {visitorId: 1, enteredAt: moment(startDate).add(6, 'd').add(23, 'h')}
                    ];
                    var expected = SegmentMetric.createEmptyBubbleArray();
                    expected[0][4] = 1;
                    expected[1][0] = 2;
                    expected[6][23] = 1;
                    var result = SegmentMetric.prepareNumberOfVisitsInTimeFrameBubbleData(encounters);
                    chai.expect(result).to.deep.equal(expected);
                });
            });
        });

        describe("Segment Metrics Data Converter", function() {
            var emptyEncounters = [];
            var e_123_1 = new Encounter("123", "123", "2014-10-15 04:30");
            var e_123_2 = new Encounter("123", "1789", "2014-10-18 05:30");
            var e_123_3 = new Encounter("123", "456",  "2014-10-18 04:30");

            var e_456_1 = new Encounter("456", "123", "2014-10-15 04:30");
            var e_456_2 = new Encounter("456", "1789", "2014-10-18 05:30");
            var e_456_3 = new Encounter("456", "456",  "2014-10-18 04:30");

            var normalEncounter = new Encounter("123", "123", moment("2014-10-15 04:30"));
            before(function() {

                chai.should();

                e_123_1.close("2014-10-15 05:00");
                e_123_2.close("2014-10-18 06:00");
                e_123_3.close("2014-10-18 05:00");

                e_456_1.close("2014-10-15 05:00");
                e_456_2.close("2014-10-18 06:00");
                e_456_3.close("2014-10-18 05:00");

            })

            describe("ListData", function() {
                it("should initial data is 0, 0, and 0 %", function() {
                   _.isEqual({
                            numberOfVisitors : 0,
                            averageDwellTime : 0,
                            repeatedVisitorPercentage : 0
                        },SegmentMetric.prepareListData(emptyEncounters)).should.be.true;
                });

                it("should initial one", function() {
                    var encounters = [e_123_1];
                    _.isEqual({
                        numberOfVisitors : 1,
                        averageDwellTime : 1800000,
                        repeatedVisitorPercentage : 0
                    }, SegmentMetric.prepareListData(encounters)).should.be.true;

                });

                it("should count only one visit for same day encounter", function() {
                    var encounters = [e_123_2, e_123_3];
                    _.isEqual({
                        numberOfVisitors : 1,
                        averageDwellTime : 3600000,
                        repeatedVisitorPercentage : 0
                    }, SegmentMetric.prepareListData(encounters)).should.be.true;
                });
                it("should count two visitors separately", function() {
                    var encounters = [e_456_1, e_123_1];
                    _.isEqual({
                        numberOfVisitors : 2,
                        averageDwellTime : 1800000,
                        repeatedVisitorPercentage : 0
                    }, SegmentMetric.prepareListData(encounters)).should.be.true;
                });
                it("should count two encounters of the same visitor in different day as repeated visitors", function() {
                    var encounters = [e_123_1, e_123_2];
                    _.isEqual({
                        numberOfVisitors : 1,
                        averageDwellTime : 1800000,
                        repeatedVisitorPercentage : 1
                    }, SegmentMetric.prepareListData(encounters)).should.be.true;
                });
                it("should count repeated visitor percentage correctly", function() {
                    var encounters = [e_123_1, e_123_2, e_456_2,e_456_3];
                    _.isEqual({
                        numberOfVisitors : 2,
                        averageDwellTime : 2700000,
                        repeatedVisitorPercentage : 0.5
                    }, SegmentMetric.prepareListData(encounters)).should.be.true;
                });
            });
        })
    });
}
