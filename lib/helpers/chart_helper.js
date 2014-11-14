ChartHelper = {};
/**
 *
 * @param selector the HTML element the graph to be attached
 * @param data an array of [$weekday, $hourOfDay, $value]
 */
ChartHelper.punchCard = function(selector, data, operatingTime) {

    console.log(data);

    var w = 768; //TODO non-hardcode
    var h = w - 50; //TODO non - hardcode

    var pad = 20; //TODO parameterize
    var leftPad = 75; //TODO parameterize

    var svg = d3.select(selector)
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var x = d3.scale.linear().domain([0, 6]).range([leftPad + pad, w - leftPad]);
    var yDomainStart = operatingTime.openingHour;
    var yDomainEnd = operatingTime.openingHour + operatingTime.getOpeningDuration() - 1;
    var y = d3.scale.linear()
        .domain([yDomainStart, yDomainEnd])
        .range([pad * 2, h - pad * 4]);
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var xAxis = d3.svg.axis().scale(x).orient("top")
            .ticks(7)
            .tickFormat(function (d) {
                return weekdays[d];
            })
        ;
    var yAxis = d3.svg.axis().scale(y).orient("left")
        .ticks(operatingTime.getOpeningDuration())
        .tickFormat(function(t) {
            return t % 24;
        });

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + pad + ", " + 2 * pad + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (leftPad - pad) + ", " + 2 * pad + ")")
        .call(yAxis);

    svg.append("text")
        .attr("class", "loading")
        .text("Loading ...")
        .attr("x", function () {
            return w / 2;
        })
        .attr("y", function () {
            return h / 2 - 5;
        });

    var max_r = _.reduce(data, function(memo, dataByDay) {
        var maxByDate =  _.reduce(dataByDay, function(memo, datum) {
            if (datum > memo) {
                return datum;
            } else {
                return memo;
            }
        }, 0);
        if (maxByDate > memo) {
            return maxByDate;
        } else {
            return memo;
        }
    }, 0);

    var r = d3.scale.linear().domain([0, max_r]).range([0,12]);

    svg.selectAll(".loading").remove();

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function (d) { return x(weekdays.indexOf(d[0])) + pad; })
        .attr("cy", function (d) { return y(d[1] < operatingTime.openingHour ? d[1] + 24 : d[1]) + 2 * pad; })
        .attr("r", function (d) { return r(d[1] != operatingTime.closingHour ? d[2] : 0); });

};
