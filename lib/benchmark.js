Benchmark = function () {};

Benchmark.isEnabled = Meteor.settings.DEBUG && Meteor.settings.DEBUG.benchmark;
Benchmark.time = function (func, description) {
  if (Benchmark.isEnabled) {
    console.time(description);
    func();
    console.timeEnd(description);
  } else {
    func();
  }
}
