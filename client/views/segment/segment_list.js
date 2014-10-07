Template.segmentList.helpers({
  //one company per user for now
  companyName: function () {
    if (Companies && Companies.findOne()) {
      return Companies.findOne().name;
    } else {
      return null;
    }
  }
});
