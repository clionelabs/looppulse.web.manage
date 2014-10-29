if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){

    describe("Check encounter is relevant", function() {
      var matcher;
      var installationIds = [1, 2];
      var baseDate;

      var getDateBySec = function(seconds) {
        return moment(baseDate).add(seconds, 's');
      }
      
      beforeEach(function() {
        matcher = SegmentVisitorMatcher.prototype;
        matcher.segment = {};
        baseDate = moment().unix();
      }); 

      it("no criteria", function() {
        matcher.segment.criteria = {};
        var encounter = {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1 * 1000};
        chai.assert(matcher.checkEncounterIsRelevant(encounter) === true);
      });

      it("duration at least", function() {
        matcher.segment.criteria = {durationInMinutes: {atLeast: 1}};
        var encounter = {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1 * 1000};
        chai.assert(matcher.checkEncounterIsRelevant(encounter) === false);
        var encounter = {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(60), duration: 60 * 1000};
        chai.assert(matcher.checkEncounterIsRelevant(encounter) === true);
      });

      it("duration at most", function() {
        matcher.segment.criteria = {durationInMinutes: {atMost: 1}};
        var encounter = {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(60), duration: 60 * 1000};
        chai.assert(matcher.checkEncounterIsRelevant(encounter) === true);
        var encounter = {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(61), duration: 61 * 1000};
        chai.assert(matcher.checkEncounterIsRelevant(encounter) === false);
      });
    });

    describe("Segment Visitor Matcher", function() {
      var matcher;
      var criteria;
      var installationIds;
      var encounters;
      var baseDate;

      var verifyResult = function(result, expected) {
        console.log('[Seg Match]', result, expected);
        chai.assert(result.length === expected.length, "expected " + JSON.stringify(expected)+ ", but " + JSON.stringify(result));
        for (var i = 0; i < result.length; i++) {
          chai.assert(result[i].delta === expected[i].delta, "expected " + JSON.stringify(expected) + ", but " + JSON.stringify(result));
          chai.assert(result[i].deltaAt.valueOf() === expected[i].deltaAt.valueOf(), "expected " + JSON.stringify(expected) + ", but " + JSON.stringify(result));
        }
      };

      var getDateBySec = function(seconds) {
        return moment(baseDate).add(seconds, 's');
      }

      beforeEach(function() {
        matcher = SegmentVisitorMatcher.prototype;
        baseDate = moment().unix();
      });

      describe("at least one", function() {
        beforeEach(function() {
          criteria = {times: {atLeast: 1}};
          installationIds = [1, 2];
        });

        describe("all fulfilled", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });
        });

        describe("miss one", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          }); 

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });
        });
      }); // At Least 1 - End

      describe("at most 1", function() {
        beforeEach(function() {
          criteria = {times: {atMost: 1}};
        });

        describe("all fulfilled", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });
        });

        describe("missed one", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: -1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(1), delta: 1}]);
          });
        });
        
        describe("one over at most", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(1), exitedAt: getDateBySec(2), duration: 1}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: -1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: -1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: 1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: 1}]);
          });
        });

        describe("all over at most", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1},
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(1), exitedAt: getDateBySec(2), duration: 1},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(1), duration: 1},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(1), exitedAt: getDateBySec(2), duration: 1}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: -1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: 1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: -1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(2), delta: 1}]);
          });
        });
      }); // At Most 1 - End

      describe("at least 1, last 1 day", function() {
        beforeEach(function() {
          criteria = {times: {atLeast: 1}, days: {inLast: 1}}; 
        });

        describe("all fullfill", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(10), duration: 10},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(10), exitedAt: getDateBySec(20), duration: 10}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: 1}, {deltaAt: getDateBySec(10 + 3600 * 24), delta: -1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: -1}, {deltaAt: getDateBySec(20 + 3600 * 24), delta: 1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: 1}, {deltaAt: getDateBySec(20 + 3600 * 24), delta: -1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: -1}, {deltaAt: getDateBySec(10 + 3600 * 24), delta: 1}]);
          });
        });
      });

      describe("at most 1, last 1 day", function() {
        beforeEach(function() {
          criteria = {times: {atMost: 1}, days: {inLast: 1}};
        });

        describe("one over", function() {
          beforeEach(function() {
            encounters = [
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(0), exitedAt: getDateBySec(10), duration: 10},
              {installationId: 2, visitorId: 1, enteredAt: getDateBySec(10), exitedAt: getDateBySec(20), duration: 10},
              {installationId: 1, visitorId: 1, enteredAt: getDateBySec(10), exitedAt: getDateBySec(20), duration: 10}
            ];
          });

          it("Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: -1}, {deltaAt: getDateBySec(10 + 3600 * 24), delta: 1}, {deltaAt: getDateBySec(20 + 3600 * 24), delta: -1}]);
          });

          it("Not Been All", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'all'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: -1}, {deltaAt: getDateBySec(20 + 3600 * 24), delta: 1}]);
          });

          it("Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: true, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: 1}, {deltaAt: getDateBySec(20 + 3600 * 24), delta: -1}]);
          });

          it("Not Been Any", function() {
            var result = matcher.doComputeCurrentStatus(_.extend({hasBeen: false, to: 'any'}, criteria), installationIds, encounters, encounters[encounters.length-1].exitedAt);
            verifyResult(result, [{deltaAt: getDateBySec(20), delta: 1}, {deltaAt: getDateBySec(10 + 3600 * 24), delta: -1}, {deltaAt: getDateBySec(20 + 3600 * 24), delta: 1}]);
          });
        });
      });
    });
  });
}
