if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){
    describe("Segment Match Criteria", function(){
      it("matchHasBeenToAll", function(){
        Encounters.insert({installationId: 1, visitorId: 1, enteredAt: 0, exitedAt: 1});
        var criteria = {
          times: {atLeast: 1} 
        }
        var smc = new SegmentMatchCriteria(criteria);

console.log(Encounters.find().count());

        smc.installationIds = [1];
        var result = smc.matchHasBeenToAll();
        console.log(result);
        // chai.assert(false);
      });
    });
  });
}
