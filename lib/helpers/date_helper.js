DateHelper = {};
DateHelper.getSevenDaysAgoTimestamp = function() {
    return moment( moment().subtract(7, 'days').format("YYYY-MM-DD"), "YYYY-MM-DD").valueOf();

}