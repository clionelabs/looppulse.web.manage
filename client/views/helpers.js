// Common Helper function please go here.
UI.registerHelper('fraction',
  function(a,b){
      var result = (a/b*100).toFixed(2)
      if (!isNaN(result))
        return result+"%";
      else
        return "0%"
  }
);

UI.registerHelper('invertedFraction',
  function(a,b){
      var result = (((b-a)/b)*100).toFixed(2)
      if (!isNaN(result))
        return result+"%";
      else
        return "0%"
  }
);

UI.registerHelper('percentage',
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

UI.registerHelper('log',
  function(obj){
      console.log("UI object logging:", obj)
  }
);

UI.registerHelper('rand',
  function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
)

UI.registerHelper('obtain',
  function(obj, prop) {
    if (obj) {
      return obj[prop]
    } else {
      return null
    }
  }
)