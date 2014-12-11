DateHelper = {};
DateHelper.getSevenDaysAgoTimestamp = function() {
    return moment( moment().subtract(7, 'days').format("YYYY-MM-DD"), "YYYY-MM-DD").valueOf();

}

DateHelper.getTodayTimestamp = function() {
    return moment().add(1, 'days').hour(0).minute(0).second(0).milliseconds(0).valueOf();
}

DateHelper.getFromTimestampFromSession = function() {
    var timestamp = +Session.get("from");
    if (!timestamp) {
        timestamp = DateHelper.getSevenDaysAgoTimestamp();
        Session.setAuth("from", timestamp);
    }
    return timestamp;
}

DateHelper.getToTimestampFromSession = function() {
    var timestamp = +Session.get("to");
    if (!timestamp) {
        timestamp = DateHelper.getTodayTimestamp();
        Session.setAuth("to", timestamp);
    }
    return timestamp;
}

DateHelper.setUpDatePicker = function(from, to) {
    if (Meteor.isClient) {
        var format = "MMM DD, YYYY";
        $('#datepicker-container').show();
        $('#datepicker').html(
            moment(+from).format(format)
                + " to "
                + moment((+to) - 1).format(format));//stupid jqueryrangepicker has inclusive to , e.g 0 - 1000, is defined as 0 - 999
        $('#datepicker').daterangepicker({
            ranges: {
                'Last 7 Days': [moment().subtract('days', 6), moment()],
                'Last 30 Days': [moment().subtract('days', 29), moment()],
                'Last 60 Days': [moment().subtract('days', 59), moment()]
            },
            format: format,
            maxDate: moment(),
            startDate: moment(+from),
            endDate: moment((+to) - 1)//stupid jqueryrangepicker has inclusive to , e.g 0 - 1000, is defined as 0 - 999

        }, function (start, end, label) {
            Session.setAuth("from", start.valueOf());
            Session.setAuth("to", +end.valueOf() + 1);//stupid jqueryrangepicker has inclusive to , e.g 0 - 1000, is defined as 0 - 999
            window.location.reload();
        });
    }
}