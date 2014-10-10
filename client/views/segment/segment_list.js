Template.segmentList.helpers({
  formatToThousand: function (num) {
    if (num > 1000) {
      return numeral(num).format('0.00a');
    } else {
      return numeral(num).format('0.0');
    }
  },
  formatPercent: function (num) {
    if (_.isNaN(num)) {
      return 'N/A';
    }
    return numeral(num).format('0.00%');
  },
  formatDurationToMin: function (num) {
    if (num > 60000) {
      return moment(num).diff(moment(0), 'minutes') + ' min';
    } else {
      return moment(num).diff(moment(0), 'seconds') + ' sec';
    }
  }
});
