Scheduler = {};

Scheduler.init = function () {
  _.each(this.jobs, function(job){
    console.log("[Scheduler] Adding job: " + job.name);
    SyncedCron.add({
      name: job.name,
      schedule: job.schedule,
      job: job.job
    });
  });
};

Scheduler.start = function () {
  SyncedCron.start();
};

Scheduler.startup = function () {
  Scheduler.init();
  Scheduler.start();
};

// Refer https://github.com/percolatestudio/meteor-synced-cron for formatting.
Scheduler.jobs = [
  {
    name: "3 am daily task",
    schedule: function (parser) {
      // fires every day at 3am.
      return parser.recur().on(3).hour();
    },
    job: function () {
      console.log("[Scheduler] Running scheduled task: UpdateSegmentVisitors");
      return UpdateSegmentVisitors();
    }
  }
];
