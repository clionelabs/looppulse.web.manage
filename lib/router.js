Router.configure({
  layoutTemplate: 'layout',
  waitOn: function() { return [Meteor.subscribe('owned-company'), Meteor.subscribe('owned-locations')] }
});

Router.map(function() {
  this.route('greeting', {path: '/'});

  this.route('company', {
    path:'/c/:_id',
    data: function(){ return Companies.findOne(this.params._id) }
  })

  this.route('location', {
    path: '/l/:_id',
    data: function(){ return Locations.findOne(this.params._id) }
  });

});