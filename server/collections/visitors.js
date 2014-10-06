Visitors.findOneOrCreateByUuid = function (uuid) {
  var selector = { uuid: uuid };
  Visitors.upsert(selector, { $setOnInsert: selector });
  return Visitors.findOne(selector);
};

Visitors.identifyUser = function (uuid, externalId) {
  Visitors.upsert({ uuid: uuid }, {
    $set: {
      externalId: externalId
    }
  });
};
