Template.segmentList.helpers({
  formatToThousand: function (num) {
    if (num > 1000) {
      return numeral(num).format('0.00a');
    } else {
      return numeral(num).format('0,0');
    }
  },
  formatPercent: FormatHelper.formatPercent,
  formatDurationToMin: FormatHelper.formatDurationToMin
});

Template.segmentList.rendered = function() {
  var self = this;
  var format = "MMM DD, YYYY";

  $('#datepicker-container').show();
  $('#datepicker').html(moment(self.data.from).format(format) + " to " + moment(self.data.to).format(format));
  $('#datepicker').daterangepicker({
    ranges : {
      'Last 7 Days': [moment().subtract('days', 6), moment()],
      'Last 30 Days': [moment().subtract('days', 29), moment()],
      'Last 60 Days': [moment().subtract('days', 59), moment()]
    },
    format: format,
    maxDate: moment(),
    startDate: moment(self.data.from),
    endDate: moment(self.data.to)
  }, function(start, end, label) {
    Session.setAuth("from", start.valueOf());
    Session.setAuth("to", end.valueOf());
    window.location.reload();
  });
}
