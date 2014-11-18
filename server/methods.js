Meteor.methods({
  createInCollection: function(collectionName, obj, companyId) {
    console.log("Called Create", collectionName, obj);

    var user = Meteor.user();
    var userId = user._id;
    var isAdmin = Roles.userIsInRole(user, ['admin']);
    if (!user
      || (!isAdmin && (companyId && AccountsHelper.companyMatch(companyId, userId)))) {
      throw new Meteor.Error(401, "You need to be an authorized person for this action");
    }

    //Should be a white list filtering but it can be process later
    if (collectionName === "Users" || collectionName === "users" || collectionName === "Roles") {
      throw new Meteor.Error(401, "Operation is Forbidden for this collections");
    }

    console.log("Creating", collectionName, this);
    var scope = Function('return this')();
    var _collection = scope[collectionName];
    if (!_collection) {
      throw new Meteor.Error(401, "Operation is not allowed");
    }

    //do some checking
    // FIXME very dirty HACK to convert criteria to stored format
    if (collectionName === 'Segments') {
      delete obj.criteria.triggerPoints;
      var criteria = obj.criteria;
      obj.criteria.hasBeen =  (obj.criteria.hasBeen === 'true');
      if (obj.criteria.times) {
        if (obj.criteria.times.atMost) {
          obj.criteria.times.atMost = parseInt(obj.criteria.times.atMost);
        }
        if (obj.criteria.times.atLeast) {
          obj.criteria.times.atLeast = parseInt(obj.criteria.times.atLeast);
        }
      }
      if (obj.criteria.durationInMinutes) {
        if (obj.criteria.durationInMinutes.atLeast) {
          obj.criteria.durationInMinutes.atLeast = parseInt(obj.criteria.durationInMinutes.atLeast);
        }
        if (obj.criteria.durationInMinutes.atMost) {
          obj.criteria.durationInMinutes.atMost = parseInt(obj.criteria.durationInMinutes.atMost);
        }
      }
      if (!obj.criteria.hasBeen) {
        delete obj.criteria.times;
        delete obj.criteria.durationInMinutes;
      }
      if (criteria.days && criteria.days.dateTime) {
        if (criteria.days.dateTime.start) {
          criteria.days.start = +moment(criteria.days.dateTime.start, "MM-DD-YYYY");
        }
        if (criteria.days.dateTime.end) {
          criteria.days.end = +moment(criteria.days.dateTime.end, "MM-DD-YYYY");
        }
        delete criteria.days.dateTime;
      }
      if (criteria.days && criteria.days.inLast) {
        criteria.days.inLast = parseInt(criteria.days.inLast);
      }
      var newTriggerLocations = [];
      _.each(obj.criteria.triggerLocations, function (triggerLocationConfig) {
        _.each(triggerLocationConfig, function (ids, key) {
          if (key === 'floorLevel') {
            key = 'floorId';
          }
          _.each(ids, function (id) {
            var newTriggerLocationConfig = {};
            newTriggerLocationConfig[key] = id;
            newTriggerLocations.push(newTriggerLocationConfig);
          });
        });
      });
      obj.criteria.triggerLocations = newTriggerLocations;
    }

    var _id = _collection.insert(obj);
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
  removeInCollection: function(collectionName, _id) {
    console.log("Called Delete", collectionName, "for", _id);

    var user = Meteor.user();
    if (!user || !Roles.userIsInRole(user, ['admin'])) {
      throw new Meteor.Error(401, "You need to be an admin");
    }

    if (collectionName === "Segments") {
      console.log("[Methods] Removing Segment", _id);
      Segments.remove(_id);
    } else {
      throw new Meteor.Error(401, "Operation is not allowed");
    }
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

    var visitorsDict = SegmentVisitorFlows.getSegmentVisitorIdsWithTimeDict(segmentId, moment().valueOf());
    var r = [];
    _.each(visitorsDict, function(enteredAt, visitorId) {
        var visitor = Visitors.findOne(visitorId);
        r.push({
          'LoopPulse ID': visitorId,
          'External ID': (visitor.externalId === null || visitor.externalId === undefined) ? "" : visitor.externalId,
          'Added At': new Date(enteredAt).toISOString()
        });
    });
    return r;
  },
  getSegmentCriteriaToString: function(criteria) {
    var str = Segment.criteriaToString(criteria);
    console.log(str);
    return str;
  },

  genSegmentListData: function(from, to) {
    Metric.generateAllSegmentsGraph(Meteor.userId(), from, to);
  },

  genSegmentData: function(segmentId, from, to) {
    Metric.generateAllGraph(Meteor.userId(), segmentId, from, to);
  }
});
