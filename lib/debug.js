Debug = function() {}

Debug.observeChanges = function() {
  this.observeVisitors();
  this.observeEncouters();
  this.observeMetrics();
  this.observeMessages();
}

Debug.observeVisitors = function() {
  var printNewVisitor = function(v) {
    console.info("[Visitor] "+v._id+" created with UUID: ", v.uuid);
  }
  Visitors.find().observe({
    _suppress_initial: true,
    "added": function(newDoc) { printNewVisitor(newDoc); }
  });
}

Debug.physical = function(productId) {
  var product = Products.findOne(productId);
  var description;
  if (product) {
    switch (product.type) {
      case "entrance":
        description = "Entrances";
        break;
      case "cashier":
        description = "Cashiers";
        break;
      default:
        description = "Products"
    }
  } else {
    console.warn("[Debug.physical] can't find ", productId);
  }
  return description+"["+productId+"] ("+(product ? product.name : product)+")";
};

// We picked /visitors/visitor_uuid because client side generally does not
// know about the actual id of a visitor on our database.
Debug.visitorLogRef = function (visitorId) {
  var debugConfig = Meteor.settings.DEBUG;
  if (debugConfig.visitorsFirebaseURL) {
    var visitor = Visitors.findOne({ _id: visitorId });
    var fbPath = debugConfig.visitorsFirebaseURL;
    fbPath += "/" + visitor.uuid + "/logs";
    return new Firebase(fbPath);
  }
  // Can't generage a visitor firebase ref since we weren't given the base URL.
  return undefined;
};

Debug.logVisitorToFirebase = function (visitorId, data) {
  var visitorRef = Debug.visitorLogRef(visitorId);
  if (visitorRef) {
    visitorRef.push(data);
  }
}

Debug.observeEncouters = function() {
  var printClosedEncounter = function(e) {
    var installation = Installations.findOne({_id: e.installationId});
    var product = Debug.physical(installation.productId);
    console.info("[Encounter] "+e._id+" Visitor["+e.visitorId+"] visited "+product+" from "+e.enteredAt+" to "+e.exitedAt+" for "+e.duration/1000+" seconds.");
  }

  var printOpenEncounter = function (e) {
    var installation = Installations.findOne({_id: e.installationId});
    var product = Debug.physical(installation.productId);
    console.info("[Encounter] "+e._id+" Visitor["+e.visitorId+"] entered "+product+".");
  }

  var logNewEncounterToFirebase = function (encounter) {
    var installation = Installations.findOne(encounter.installationId);
    var data = { "type": "visit",
                 "location": installation.locationDescription(),
                 "enteredAt": encounter.enteredAt.valueOf(),
                 "exitedAt": encounter.exitedAt.valueOf(),
                 "sortedBy": encounter.enteredAt.valueOf(),
                 "durationInSeconds": encounter.duration/1000 };
    Debug.logVisitorToFirebase(encounter.visitorId, data);
  };

  Encounters.findOpen().observe({
    _suppress_initial: true,
    "added": function(newDoc) { printOpenEncounter(newDoc); }
  });

  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": function(newDoc) { printClosedEncounter(newDoc);
                                logNewEncounterToFirebase(newDoc); }
  });
};

Debug.location = function(_id) {
  var loaded = Locations.findOne({_id:_id});
  return "Location ["+loaded._id+"] ("+loaded.name+")"
};

Debug.observeMetrics = function() {
  //TODO change to new metrics
};

Debug.logDeliveringMessageToFirebase = function(message) {
  var debugConfig = Meteor.settings.DEBUG;
  if (debugConfig && debugConfig.deliveringMessagesFirebaseURL) {
    var deliveringMessagesRef = new Firebase(debugConfig.deliveringMessagesFirebaseURL);
    deliveringMessagesRef.push(message);
  }
};

Debug.observeMessages = function() {
  var printNewMessage = function(message) {
    var engagementContext = EngagementContexts.findOne({_id: message.engagementContextId});
    console.info("[Message] " + message._id + " was delivered to Visitor[" + engagementContext.visitorId + "]: '" +
                 engagementContext.alertMessage + "' due to Engagement[" + engagementContext.engagementId + "]");
  };

  var printReadMessage = function(message) {
    var secondsToRead = (message.viewedAt - message.createdAt)/1000;
    console.info("[Message] " + message._id + " was read in " + secondsToRead + " seconds");
  };

  var logNewMessageToFirebase = function (message) {
    var engagementContext = EngagementContexts.findOne({_id: message.engagementContextId});
    var data = { "type": "message",
                 "body": engagementContext.alertMessage,
                 "sortedBy": message.createdAt,
                 "createdAt": message.createdAt};
    Debug.logVisitorToFirebase(engagementContext.visitorId, data);
  };

  Messages.find().observe({
    _suppress_initial: true,
    "added": function(newMessage) {
      printNewMessage(newMessage);
      logNewMessageToFirebase(newMessage);
      Debug.logDeliveringMessageToFirebase(newMessage); },

    "changed": function(newDoc, oldDoc) {
      if (!oldDoc.viewedAt && newDoc.viewedAt) { printReadMessage(newDoc); };
    }
  });
};
