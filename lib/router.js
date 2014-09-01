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

AdminController = RouteController.extend({
  onBeforeAction: function(pause) {
      AccountsEntry.signInRequired(this, pause, Roles.userIsInRole(Meteor.user(), ['admin']));
      console.log("On Admin Page")
      if (Meteor.loggingIn()) {
          this.render(this.loadingTemplate);
      } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
          console.log('redirecting');
          this.redirect('/');
      }
  }
})
CollectionShowViewController = AdminController.extend({
  // Return Data
  // data: function(){
  //   return { cursor: {}, object: {}, prop: "" }
  // },
  template: "collection_show_view"
})
CollectionCreateViewController = AdminController.extend({
  template: "collection_create_view"
})
CollectionUpdateViewController = AdminController.extend({
  template: "collection_update_view"
})

Router.map(function() {
  this.route('authenticate', {
    path: '/api/authenticate/applications/:applicationId',
    where: 'server',
    action: function() {
      var requestMethod = this.request.method;
      if (requestMethod!="GET") {
        this.response.writeHead(403, {'Content-Type': 'text/html'});
        this.response.end('<html><body>Unsupported method: ' + requestMethod + '</body></html>');
        return;
      }

      var token = this.request.headers["x-auth-token"];
      var applicationId = this.params.applicationId;
      var authenticatedResponse = Application.authenticatedResponse(applicationId, token);
      if (authenticatedResponse.statusCode != 200) {
        console.warn("[API] Application "+applicationId+
                     " failed to authenticate with token "+token+
                     " from "+JSON.stringify(this.request.headers));
      }
      this.response.writeHead(authenticatedResponse.statusCode,
                              {'Content-Type': 'application/json'});
      this.response.end(JSON.stringify(authenticatedResponse));
    }
  })

  this.route('greeting', {path: '/'});
  // Company Dashboard
  this.route('company', {
    path:'/companies/:companyId',
    data: function(){ return Companies.findOne(this.params.companyId) },
    onBeforeAction: function (pause) {
      AccountsHelper.signInAsCompanyUser(this, pause, this.params.companyId)
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
                Meteor.subscribe('related-metrics', this.params.locationId),
                Meteor.subscribe('location-engagements', this.params.locationId)];
    },
    onBeforeAction: function (pause) {
      AccountsHelper.signInAsCompanyUser(this, pause, this.params.companyId)
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
    onBeforeAction: function (pause) {
      AccountsHelper.signInAsCompanyUser(this, pause, this.params.companyId)
    }
  });

  this.route('admin_dashboard', {
    path:'/admin',
    controller: AdminController
  });


  this.route('admin_company_show', {
    path:'/admin/companies/list/',
    controller: CollectionShowViewController,
    data: function(){
      return { cursor: Companies.find(), fields: ["_id", "name"], hasRowPrepend: " " }
    },
    waitOn: function(){
      return Meteor.subscribe('all-companies')
    },
    yieldTemplates:{
      "hello" : { to: "view-header" },
      "admin_collection_actions": { to: "row-prepend" }
    }
  });

  this.route('admin_company_create', {
    path:'/admin/companies/create/',
    controller: CollectionCreateViewController,
    data: function(){
      return { fields: ["name"], collectionName:"Companies", title: "Create New Company" }
    },
    waitOn: function(){
      //return Meteor.subscribe('all-companies')
    }
  });

  this.route('admin_company_update', {
    path:'/admin/companies/:companyId/update/',
    controller: CollectionUpdateViewController,
    data: function(){
      var companyId = this.params.companyId; //need checking
      var data = Companies.findOne(companyId)
      if (data) {
        return { data: data , fields: ["name"], collectionName:"Companies", title: "Update Company - "+data._id }
      } else {
        return null;
      }
    },
    waitOn: function(){
      return [Meteor.subscribe('all-companies'), Meteor.subscribe("admin-assignee", this.params.companyId)];
    },
    yieldTemplates:{
      "admin_assign_superuser" : { to: "form-extension" },
      "admin_company_new_user" : { to: "view-footer" }
    }
  });
});
