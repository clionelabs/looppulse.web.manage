Meteor.methods({
  createInCollection: function(collectionName, obj) {
    console.log("Called Create", collectionName, obj)

    var user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(401, "You need to be an admin");

    //Should be a white list filtering but it can be process later
    if (collectionName === "Users" || collectionName === "users" || collectionName === "Roles")
      throw new Meteor.Error(401, "Operation is Forbidden for this collections");

    // remove the user
    console.log("Creating", collectionName, this)
    var scope = Function('return this')();
    var _collection = scope[collectionName]
    if (!_collection)
      throw new Meteor.Error(401, "Operation is not allowed");

    //do some checking

    var _id = _collection.insert(obj)
    return _id;
  }
});