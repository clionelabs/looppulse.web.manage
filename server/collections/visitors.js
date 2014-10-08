/**
 *
 * @param selector
 * @param selector.companyId
 * @param selector.uuid
 * @returns {Visitor}
 */
Visitors.findOneOrCreate = function (selector) {
  Visitors.upsert(selector, { $setOnInsert: selector });
  return Visitors.findOne(selector);
};

Visitors.identifyUser = function (companyId, uuid, externalId) {
  var selector = {
    companyId: companyId,
    uuid: uuid
  };
  Visitors.upsert(selector, {
    $set: { externalId: externalId },
    $setOnInsert: selector
  });
};
