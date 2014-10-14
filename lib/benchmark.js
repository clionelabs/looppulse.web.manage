Benchmark = function () {};

Benchmark.isEnabled = Meteor.settings.DEBUG && Meteor.settings.DEBUG.benchmark;
Benchmark.data = {}
Benchmark.time = function (func, description) {
  if (Benchmark.isEnabled) {
    start_time = (new Date()).getTime();
    func();
    end_time = (new Date()).getTime();
    Benchmark.receiveNewValue(description, end_time-start_time);
    Benchmark.display(description, end_time-start_time);
  } else {
    func();
  }
}
Benchmark.receiveNewValue = function (key, duration) {
    if (!(key in Benchmark.data)) {
        Benchmark.data[key] = {'count': 0, 'sum': 0, 'sum_square': 0};
    }
    data = Benchmark.data[key];
    data.count += 1;
    data.sum += duration;
    data.sum_square += duration * duration;
}
Benchmark.display = function (key, duration) {
    if (!(key in Benchmark.data)) return;

    data = Benchmark.data[key];
    average = data['sum'] / data['count'];
    std = Math.sqrt(data['sum_square']/data['count'] - average*average);
    console.log(key, "exec time:", duration, "ms, avg:", average.toFixed(2), ", std:", std.toFixed(2));
}
