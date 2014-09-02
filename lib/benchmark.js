Benchmark = function () {};

Benchmark.time = function (description, func) {
  console.time(description);
  func();
  console.timeEnd(description);
}
