Template.locationsList.helpers({ 
  locations: function() {
    return Locations.find(); 
  }
});