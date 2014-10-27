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

Template.segmentList.created = function () {
  var from = moment( moment().subtract(7, 'days').format("YYYY-MM-DD"), "YYYY-MM-DD").valueOf();
  var to = null;
  Meteor.call("genSegmentListData", from, to, function(err, res){

  });
};
