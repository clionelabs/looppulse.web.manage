// Common Helper function please go here.
Template.registerHelper('fraction',
  function(a,b){
      var result = (a/b*100).toFixed(2)
      if (!isNaN(result))
        return result+"%";
      else
        return "0%"
  }
);

Template.registerHelper('invertedFraction',
  function(a,b){
      var result = (((b-a)/b)*100).toFixed(2)
      if (!isNaN(result))
        return result+"%";
      else
        return "0%"
  }
);

Template.registerHelper('percentage',
  function(a,d){
      var result = (a*100)
      if (d)
        result.toFixed(d)
      else
        Math.round(result)

      if (!isNaN(result))
        return result+"%";
      else
        return "0%"
  }
)

Template.registerHelper('log',
  function(obj){
      console.log("UI object logging:", obj)
  }
);

Template.registerHelper('rand',
  function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
)

Template.registerHelper('obtain',
  function(obj, prop) {
    if (obj) {
      return obj[prop]
    } else {
      return null
    }
  }
)

Template.registerHelper('size', function(arr){
  return arr.length;
})

Template.registerHelper('getSession', function(key){
  return Session.get(key);
})

Template.registerHelper('keys', function(o){
  return Object.keys(o);
})

Template.registerHelper("equals", function (a, b) {
  return a+"" === b+"";
});
//copy from https://github.com/XpressiveCode/iron-router-active/blob/master/lib/client/helpers.js
var routeUtils = {
  context: function() {
    return Router.current();
  },

  regex: function(expression) {
    return new RegExp(expression, 'i');
  },

  testRoutes: function(routeNames) {
    var reg = this.regex(routeNames);
    return this.context() && reg.test(this.context().route.name);
  },

  testPaths: function(paths) {
    var reg = this.regex(paths);
    return this.context() && reg.test(this.context().path);
  }
};

Template.registerHelper('isActiveRoute', function(routes, className) {
  if (className.hash)
    className = 'active';

  return routeUtils.testRoutes(routes) ? className : '';
});

Template.registerHelper('isActivePath', function(paths, className) {
  if (className.hash)
    className = 'active';

  return routeUtils.testPaths(paths) ? className : '';
});

Template.registerHelper('isNotActiveRoute', function(routes, className) {
  if (className.hash)
    className = 'disabled';

  return ! routeUtils.testRoutes(routes) ? className : '';
});

Template.registerHelper('isNotActivePath', function(paths, className) {
  if (className.hash)
    className = 'disabled';

  return ! routeUtils.testPaths(paths) ? className : '';
});