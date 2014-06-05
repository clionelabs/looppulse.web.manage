Router.configure({
  layoutTemplate: 'layout',
  waitOn: function() {
      return [ //Meteor.subscribe('owned-company'),
               //Meteor.subscribe('owned-locations'),
               //Meteor.subscribe('owned-products'),
               //Meteor.subscribe('owned-installations'),
               //Meteor.subscribe('related-encounters')
                ] ;
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
    path:'/c/:_id',
    data: function(){ return Companies.findOne(this.params._id) }

  })

  this.route('location', {
    path: '/l/:_id',
    data: function(){ return Locations.findOne(this.params._id) },
    waitOn: function(){
      return [  Meteor.subscribe('owned-installations', this.params._id, function(){
                  console.log(Installations.findOne())
                }),
                Meteor.subscribe('related-encounters')];
    }
  });

});