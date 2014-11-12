Locations = new Meteor.Collection('locations', {
  transform: function(doc) {
    return new Location(doc.companyId, doc.name, doc.address, doc.coordinate, doc.operatingTime);
  }
});

/**
 * - belongs to a {@link Company}
 * - has many {@link Installation}
 * - has many {@link Product} thru {@link Installation}
 * - has many {@link Beacon} thru {@link Installation}
 *
 * @param companyId
 * @param name
 * @param address
 * @param coordinate
 * @param operatingTime
 * @constructor
 *
 * @property companyId
 * @property name
 * @property address
 * @property coordinate
 * @property operatingTime
 */
Location = function(companyId, name, address, coordinate, operatingTime) {
  // companyId & name will be used as primary keys.
  this.companyId = companyId;
  this.name = name;
  this.address = address;
  this.coordinate = coordinate;
  this.operatingTime = new Location.OperatingTime(operatingTime.openingHour, operatingTime.closingHour);
}

Location.prototype.save = function() {
  var selector = {
    companyId: this.companyId,
    name: this.name
  };
  var modifier = {
    $set: {
      address: this.address,
      coordinate: this.coordinate,
      operatingTime: this.operatingTime
    }
  };
  var result = Locations.upsert(selector, modifier);
  if (result.insertedId) {
    this._id = result.insertedId;
  } else {
    this._id = Locations.findOne(selector)._id;
  }
  return this._id;
}


/**
 *
 * @param openingHour int from 0 - 23
 * @param closingHour int from 0 - 23
 * @constructor
 */
Location.OperatingTime = function(openingHour, closingHour) {
  this.openingHour = openingHour;
  this.closingHour = closingHour;
}

Location.OperatingTime.prototype.getOpeningDuration = function() {
  return (this.closingHour - this.openingHour + 24) % 24;
}

