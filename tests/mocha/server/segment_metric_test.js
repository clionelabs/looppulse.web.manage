if (!(typeof MochaWeb === "undefined")) {
    MochaWeb.testOnly(function() {

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