Meteor.methods({
  createInCollection: function(collectionName, obj, companyId) {
    console.log("Called Create", collectionName, obj)

    var user = Meteor.user();
    var userId = user._id
    var isAdmin = Roles.userIsInRole(user, ['admin'])
    if (!user
      || (!isAdmin && (companyId && AccountsHelper.companyMatch(companyId, userId)))
      )
      throw new Meteor.Error(401, "You need to be an authorized person for this action");

    //Should be a white list filtering but it can be process later
    if (collectionName === "Users" || collectionName === "users" || collectionName === "Roles")
      throw new Meteor.Error(401, "Operation is Forbidden for this collections");

    console.log("Creating", collectionName, this)
    var scope = Function('return this')();
    var _collection = scope[collectionName]
    if (!_collection)
      throw new Meteor.Error(401, "Operation is not allowed");

    //do some checking

    var _id = _collection.insert(obj)
    return _id;
  },
  updateInCollection: function(collectionName, _id, obj) {
    console.log("Called Update", collectionName, "for", _id, " with ", obj)

    var user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

    //Should be a white list filtering but it can be process later
    if (collectionName === "Users" || collectionName === "users" || collectionName === "Roles")
      throw new Meteor.Error(401, "Operation is Forbidden for this collections");

    console.log("Updating", collectionName, this)
    var scope = Function('return this')();
    var _collection = scope[collectionName]
    if (!_collection || !_id)
      throw new Meteor.Error(401, "Operation is not allowed");

    //do some checking

    var res = _collection.update({"_id": _id}, obj) //return row affected.
    return res;
  },
  updateUserProfileByEmail: function(userEmail, mapper){
    console.log("Updating User profile:", userEmail, mapper)

    //check current user
    var user = Meteor.user();
    var data = {}
    if (!user || !Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

    //do some checking
    if (!userEmail || !mapper)
      throw new Meteor.Error(401, "Missing Parameter")

    var datas = [].concat(mapper)

    datas.forEach(function(o){
      data[o.key] = o.val
    })

    var res = Meteor.users.update({ "emails.address": userEmail },{ $set:{ profile: data  } });
    return res;
  },
  updateUserProfileById: function(userId, mapper){
    console.log("Updating User profile:", userId, mapper)

    //check current user
    var user = Meteor.user();
    var data = {}
    if (!user || !Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

    //do some checking
    if (!userId || !mapper)
      throw new Meteor.Error(401, "Missing Parameter")

    var datas = [].concat(mapper)

    datas.forEach(function(o){
      data[o.key] = o.val
    })

    var res = Meteor.users.update(userId,{ $set:{ profile: data  } });
    return res;
  },
  getSegmentCsvData: function(segmentId) {
    if (!AccountsHelper.canViewSegment(segmentId)) {
      throw new Meteor.Error(401, 'User is not allowed to view segment: ' + segmentId);
    }

    return SegmentVisitors.find({ segmentId: segmentId }, {
      sort: { addedAt: -1 },
      transform: function(doc) {
        var visitor = Visitors.findOne(doc.visitorId);
        return {
          'ID': doc.visitorId,
          'External ID': visitor.externalId,
          'Added At': new Date(doc.addedAt).toISOString()
        };
      }
    }).fetch();

  }
});
