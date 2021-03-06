FormatHelper = {};

FormatHelper.formatPercent = function(num) {
  if (_.isNaN(num)) {
    return 'N/A';
  } else {
    var display = numeral(num).format('0.00%');
    if (display == "0.00%") {
      return "-";
    } else {
      return display;
    }
  }
};
FormatHelper.formatDurationToMin = function (num) {
  if (num > 60000) {
    return moment(num).diff(moment(0), 'minutes') + ' min';
  } else {
    return moment(num).diff(moment(0), 'seconds') + ' sec';
  }
};
