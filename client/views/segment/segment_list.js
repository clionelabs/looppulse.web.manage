Template.segmentList.helpers({
  isLargerThanThousand : function(num) {
    return num > 1000;
  },
  isTimeLargerThanMinute : function(num) {
    return num > 60000;
  },
  formatThousand : function(num) {
    return numeral(num).format('0.00a');
  },
  formatPercent : function(num) {
    return numeral(num).format('0.00%');
  },
  formatDurationToMin : function(num) {
    return moment(num).diff(moment(0), 'minutes') + 'min';
  },
  formatDurationToSec : function(num) {
    return moment(num).diff(moment(0), 'seconds') + 'sec';
  }
  
});
