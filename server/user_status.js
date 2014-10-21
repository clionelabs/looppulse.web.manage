Meteor.users.find({ "status.online": true }).observe({
    added: function(id) {
        // id just came online
        console.log(JSON.stringify(id) + " is online.");
    },
    removed: function(id) {
        // id just went offline
        console.log(JSON.stringify(id) + " is offline.");
    }
});
