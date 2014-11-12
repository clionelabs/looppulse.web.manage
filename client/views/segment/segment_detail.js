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
  },
  "click #showDelete": function() {
    var self = this;
    bootbox.confirm("Are you sure you want to remove the segment " + self.name + "?", function(result) {
        if (result) {
            console.log("Removing Segment", self.name);
            Notifications.info("Removing", "Segment " + self.name, {timeout: 1000000, userCloseable: false});
            $.blockUI({css : {width:0, height : 0, border:0, backgroundColor : "transparent"}, message : ""});
            Meteor.call("removeInCollection", "Segments", self.segmentId, function (err, res) {
              Notifications.remove({title: "Removing"});
              $.unblockUI();
              var segmentId = res;
              if (err) {
                console.error(err);
                Notifications.error("Removing", "Removal failed -- " + err + " --");
              } else {
                console.info(res);
                Notifications.success("Removing", "Removed: '"+self.name + "'. Redirecting to segment list...");
                Router.go('segment.list');
              }
            });
        }
    });
  }
});

Template.segmentDetail.rendered = function() {
  console.log(this.data);

  var self = this;
  var format = "MMM DD, YYYY";
  $('#datepicker-container').show();
  $('#datepicker').html(moment(+self.data.from).format(format) + " to " + moment(+self.data.to).format(format));
  $('#datepicker').daterangepicker({
    ranges : {
      'Last 7 Days': [moment().subtract('days', 6), moment()],
      'Last 30 Days': [moment().subtract('days', 29), moment()],
      'Last 60 Days': [moment().subtract('days', 59), moment()]
    },
    format: format,
    maxDate: moment()
  }, function(start, end, label) {
    Router.go("/segments/" + self.data.segmentId + "?from=" + start.valueOf() + "&to=" + end.valueOf());
  });

  c3.generate({
    bindto: "#dateXNumberOfVisitorsBarChart",
    data: {
      json: this.data.dateXNumberOfVisitorsBarChart,
      keys : {
        x : 'date',
        value: ['number of visitors']
      },
      type: 'bar',
      colors : {
        "number of visitors": "#CFD8DC"
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
          format : function(x) { return moment(x).format(SegmentMetric.TimeBucketDisplayFormat[SegmentMetric.TimeBucket.Day])}
        }

      },
      y: {
        label: {
          text: 'Number of Visitors',
          position: 'outer-middle'
        }
      }
    },
    legend: {
      position: 'right',
      show: false
    },
    bar: {
      width: {
        ratio: 0.2
      }
    },
    grid: {
      y :  {
        show: true
      }
    }
  });

  c3.generate({
    bindto: "#numberOfVisitsXNumberOfVisitorsBarChart",
    data: {
      json: this.data.numberOfVisitsXNumberOfVisitorsBarChart,
      keys : {
        x : 'count',
        value: ['number of visitors']
      },
      type: 'bar',
      colors : {
        "number of visitors": "#CFD8DC"
      }
    },
    axis: {
      x : {
        label: {
          text : 'Number of Visits',
          position: 'outer-right'
        }

      },
      y: {
        label: {
          text: 'Number of Visitors',
          position: 'outer-middle'
        }
      }
    },
    legend: {
      position: 'right',
      show: false
    },
    bar: {
      width: {
        ratio: 0.2
      }
    },
    grid: {
      y :  {
        show: true
      }
    }
  });

  c3.generate({
    bindto: "#averageDwellTimePerVisitorPerDayXNumberOfVisitorsHistogram",
    data: {
      json: this.data.averageDwellTimeXNumberOfVisitorsChart,
      keys : {
        x : 'duration',
        value: ['number of visitors']
      },
      type: 'bar',
      colors : {
        "number of visitors": "#CFD8DC"
      },
    },
    axis: {
      x : {
        label: {
          text : "Minutes",
          position: 'outer-right'
        },
        type : 'category'
      },
      y: {
        label: {
          text: 'Number of Visitors',
          position: 'outer-middle'
        }
      }
    },
    legend: {
      position: 'right',
      show: false
    },
    bar: {
      width: {
        ratio: 1
      }
    },
    grid: {
      y :  {
        show: true
      }
    }
  });

  ChartHelper.punchCard("#dwellTimePunchCard",this.data.averageDwellTimePunchCard, this.data.operatingTime);

  ChartHelper.punchCard("#enteredAtPunchCard",this.data.enteredAtPunchCard, this.data.operatingTime);
  ChartHelper.punchCard("#exitedAtPunchCard",this.data.exitedAtPunchCard, this.data.operatingTime);
}

