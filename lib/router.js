Router.configure({
  layoutTemplate: 'basicLayout',
  notFoundTemplate: 'notFound',
  yieldTemplates: {
    'header': { to: 'header' },
    'footer': { to: 'footer' }
  }
});

// Controllers are defined in `route_controllers/`
Router.map(function () {
  this.route('home', {
    path: '/',
    controller: HomeController
  });

  this.route('segment.list', {
    path: '/segments',
    controller: SegmentListController
  });
});
