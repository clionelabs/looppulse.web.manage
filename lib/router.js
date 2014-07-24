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
        console.log("Data not ready or no data")
        return null;
    }
});

if(Meteor.isClient){

  // Load Hooks

  Router.onRun( function () {
    //clearSeenErrors(); // set all errors who have already been seen to not show anymore


  });
}

AdminController = RouteController.extend({
  onBeforeAction: function() {
      AccountsEntry.signInRequired(this);
      console.log("On Admin Page")
      if (Meteor.loggingIn()) {
          this.render(this.loadingTemplate);
      } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
          console.log('redirecting');
          this.redirect('/');
      }
  }
})
ShowDataController = AdminController.extend({
  // Return Data
  // data: function(){
  //   return { cursor: {}, object: {}, prop: "" }
  // },
  template: "show"
})

Router.map(function() {
  this.route('greeting', {path: '/'});
  // Company Dashboard
  this.route('company', {
    path:'/companies/:companyId',
    data: function(){ return Companies.findOne(this.params.companyId) },
    onBeforeAction: function () {
      AccountsEntry.signInRequired(this);
    }

  })

  // Location Dashboard
  this.route('location', {
    path: '/companies/:companyId/locations/:locationId/',
    data: function(){
      console.log("Runnings", this.params.locationId)
      return Locations.findOne(this.params.locationId)
    },
    waitOn: function(){
      // note: we shouldn't believe any user input before subscribe to anything.
      console.log("Waiting Data", this.params.locationId)
      return [  Meteor.subscribe('owned-installations', this.params.locationId),
                Meteor.subscribe('related-beacon-events') ,
                Meteor.subscribe('related-funnels', this.params.locationId),
                Meteor.subscribe('related-metrics', this.params.locationId)];
    },
    onBeforeAction: function () {
      AccountsEntry.signInRequired(this);
    }
  });

  // [Debug] All beacon events in this location
  this.route('beacon_events', {
    path: '/companies/:companyId/locations/:locationId/events',
    data: function(){
      return Locations.findOne(this.params.locationId)
    },
    waitOn: function(){
      // note: we shouldn't believe any user input before subscribe to anything.
      return [  Meteor.subscribe('owned-installations', this.params.locationId),
                Meteor.subscribe('related-encounters'),
                Meteor.subscribe('related-beacon-events') ];
    },
    onBeforeAction: function () {
      AccountsEntry.signInRequired(this);
    }
  });

  this.route('admin_dashboard', {
    path:'/admin',
    controller: AdminController
  });

  this.route('admin_company_create', {
    path:'/admin/companies/create/',
    controller: AdminController
  });

  this.route('admin_company_show', {
    path:'/admin/companies/show/',
    controller: ShowDataController,
    data: function(){
      return { cursor: Companies.find(), fields: ["_id", "name"] }
    },
    waitOn: function(){
      return Meteor.subscribe('all-companies')
    }
  });
});