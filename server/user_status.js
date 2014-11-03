Meteor.users.find({ "status.online": true }).observe({

    fid: null,

    added: function(id) {
        // id just came online
        console.log(JSON.stringify(id) + " is online.");
        if (this.fid) {
            console.log("[User status] cancel remove metrics");
            Meteor.clearTimeout(this.fid);
            this.fid = null;
        }
    },
    removed: function(id) {
        // id just went offline
        console.log(JSON.stringify(id) + " is offline.");
        //ensure the user is really offline as refresh the only tab will trigger this also
        this.fid = Meteor.setTimeout(function() {
            var isStillOnline = !!Meteor.users.find({"status.online" : false, _id : id}).count();
            if (!isStillOnline) {
                Metrics.removeAllFromUser(id);
            }
        }, moment.duration(10, 'minutes').asMilliseconds());
    }
});
