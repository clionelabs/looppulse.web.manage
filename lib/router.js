Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'lost',
  waitOn: function() {
      var companyId = this.params.companyId
      console.log("Waiting Global Data", this.params.companyId)
      if(companyId)
        return [  Meteor.subscribe('owned-company', companyId),
                  Meteor.subscribe('owned-locations', companyId),
                  Meteor.subscribe('owned-products', companyId)
               ] ;
      else
        console.log("Data not ready")
        return null;
    }
});

if(Meteor.isClient){

  // Load Hooks

  Router.onRun( function () {
    //clearSeenErrors(); // set all errors who have already been seen to not show anymore


  });
}

Router.map(function() {
  this.route('greeting', {path: '/'});

  this.route('company', {
    path:'/:companyId',
    data: function(){ return Companies.findOne(this.params.companyId) }

  })

  this.route('location', {
    path: '/:companyId/place/:locationId',
    data: function(){
      console.log("Runnings", this.params.locationId)
      return Locations.findOne(this.params.locationId)
    },
    waitOn: function(){
      // note: we shouldn't believe any user input before subscribe to anything.
      console.log("Waiting Data", this.params.locationId)
      return [  Meteor.subscribe('owned-installations', this.params.locationId),
                Meteor.subscribe('related-encounters'),
                Meteor.subscribe('related-beacon-events') ];
    }
  });

  this.route('beacon_events', {
    path: '/:companyId/events/:locationId/',
    data: function(){
      return Locations.findOne(this.params.locationId)
    },
    waitOn: function(){
      // note: we shouldn't believe any user input before subscribe to anything.
      return [  Meteor.subscribe('owned-installations', this.params.locationId),
                Meteor.subscribe('related-encounters'),
                Meteor.subscribe('related-beacon-events') ];
    }
  });

});