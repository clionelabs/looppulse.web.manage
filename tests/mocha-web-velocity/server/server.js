if (!(typeof MochaWeb === 'undefined')) {
  MochaWeb.testOnly(function () {
    var assert = chai.assert;

    describe("Server initialization", function () {
      it("should print logs", function () {
        sinon.spy(console, 'info');
        configure();
        assert(console.info.called);
        console.info.restore();
      });
    });

  });
}
