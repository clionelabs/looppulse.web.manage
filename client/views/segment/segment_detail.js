Template.segmentDetail.helpers({
  formatPercent: FormatHelper.formatPercent,
  formatDurationToMin: FormatHelper.formatDurationToMin,

  isMinus: function(num) {
    if (num > 0) {
      return "inc";
    } else if (num == 0) {
      return "";
    } else {
      return "dec";
    }
  },

  
});

Template.segmentDetail.events({
  "click #showInfo": function() {
    Meteor.call("getSegmentCriteriaToString", this.criteria, function(e, msg) {
      console.log(msg);
      $("#criteria").html(msg);
      
    });
  }
});
