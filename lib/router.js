Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() { 
  this.route('locationsList', {path: '/'});

  this.route('location', { 
    path: '/loc/:_id',
    data: function(){ return Locations.findOne(this.params._id) }
  });

});