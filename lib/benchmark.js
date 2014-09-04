Benchmark = function () {};

Benchmark.time = function (func, description) {
  console.time(description);
  func();
  console.timeEnd(description);
}
