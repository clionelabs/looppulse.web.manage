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

  genLineChart: function(data) {
    var lineChart = c3.generate({
      bindto: "#lineChart",
      data: {

        json: data,
        keys : {
          x : 'date',
          value: ['number of visitors']
        },

        type: 'bar',

        colors : {
          "number of visitors": "#CFD8DC"
        },
        color : function (color, d) {

          return color;
        }
      },
      axis: {
        x : {
          label: {
            text : 'Date',
            position: 'outer-right'
          },
          type : 'timeseries',
          tick : {
            format : function(x) { return moment(x).format(SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Day])}
          }

        },
        y: {

          label: {
            text: 'Number of Visitors',
            position: 'outer-middle'
          }
        }
      },
      bar: {
        width: {
          ratio: 0.2 // this makes bar width 50% of length between ticks
        }
        // or
        //width: 100 // this makes bar width 100px
      },
      grid: {
        y :  {
          show: true
        }
      }


    });

  }

  
});

Template.segmentDetail.events({
  "click #showExport": function() {
    var self = this;
    console.log(this);
    Meteor.call('getSegmentCsvData', self.segmentId, function(error, result) {
      if (error) {
        console.error(error);
        Notifications.error('Segment', 'Segment CSV Export failed -- ' + error + ' --');
      } else {
        if (result.length === 0) {
          Notifications.warn('Segment', 'No data to export');
        } else {
          var headings = true;
          var quotes = true;
          var csv = json2csv(result, headings, quotes);
          var uri = "data:text/csv;charset=utf-8," + escape(csv);
          var filename = self.name + "-" + moment().format() + ".csv";
          //window.open has ugly filename
          //use this hacky method to allow customizing filename
          var link = document.createElement('a');
          if (typeof link.download === 'string') {
            document.body.appendChild(link); // Firefox requires the link to be in the body
            link.download = filename;
            link.href = uri;
            link.click();
            document.body.removeChild(link); // remove the link when done
          } else {
            location.replace(uri);
          }
        }
      }
    })
  },
  "click #showInfo": function() {
    Meteor.call("getSegmentCriteriaToString", this.criteria, function(e, msg) {
      console.log(msg);
      $("#criteria").html(msg);
      
    });
  }
});

Template.segmentDetail.created = function () {
  var from = DateHelper.getSevenDaysAgoTimestamp();
  var to = null;
  Meteor.call("genSegmentListData", from, to, function(err, res){
  });
};


