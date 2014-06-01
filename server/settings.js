setDefaultSettings = function() {
  if (JSON.stringify(Meteor.settings)=='{}') {
    console.log("Meteor.settings expected. Rerun: meteor --settings server/settings.json");

    // We can try to read the file using
    // https://gist.github.com/awatson1978/4625493
  }
}
