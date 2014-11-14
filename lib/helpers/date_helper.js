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