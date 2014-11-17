// Common Helper function
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