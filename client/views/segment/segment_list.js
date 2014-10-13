Template.segmentList.helpers({
  formatToThousand: function (num) {
    if (num > 1000) {
      return numeral(num).format('0.00a');
    } else {
      return numeral(num).format('0.0');
    }
  },
  formatPercent: FormatHelper.formatPercent,
  formatDurationToMin: FormatHelper.formatDurationToMin
});
