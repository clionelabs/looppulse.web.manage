Visits = new Meteor.Collection("visits");

Visit = function(beaconEvent) {
  this.visitor_id = beaconEvent.visitor_id;
}
