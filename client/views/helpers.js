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

UI.registerHelper('log',
  function(obj){
      console.log("UI object logging:", obj)
  }
);