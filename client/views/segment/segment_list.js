Template.segmentList.helpers({
  formatThousand : function(num) {
    if (num > 1000) {
      return numeral(num).format('0.00a');
    } else {
      return numberal(num).format('0.0');
    }
  },
  formatPercent : function(num) {
    return numeral(num).format('0.00%');
  },
  formatDurationToMin : function(num) {
    if (num > 60000) {
      return moment(num).diff(moment(0), 'minutes') + 'min';
    } else {
      return moment(num).diff(moment(0), 'seconds') + 'sec';
    }
  }
  
});
