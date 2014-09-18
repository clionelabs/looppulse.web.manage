Debug = function() {}

Debug.observeChanges = function() {
  console.info("[Debug.observeChanges]");
  this.observeVisitors();
  this.observeEncouters();
  this.observeMetrics();
  this.observeFunnels();
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

Debug.physical = function(id, type) {
  var loaded;
  var description;
  if (type=="product") {
    loaded = Products.findOne({_id:id});
    description = "Products"
  } else if (type=="entrance") {
    loaded = Entrances.findOne({_id:id});
    description = "Entrances";
  } else if (type=="cashier") {
    loaded = Cashiers.findOne({_id:id});
    description = "Cashiers";
  } else {
    console.warn("[Debug.physical] can't find ", id, type);
  }
  return description+"["+id+"] ("+(loaded ? loaded.name : loaded)+")";
}

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
    var product = Debug.physical(installation.physicalId, installation.type);
    console.info("[Encounter] "+e._id+" Visitor["+e.visitorId+"] visited "+product+" from "+e.enteredAt+" to "+e.exitedAt+" for "+e.duration/1000+" seconds.");
  }

  var printOpenEncounter = function (e) {
    var installation = Installations.findOne({_id: e.installationId});
    var product = Debug.physical(installation.physicalId, installation.type);
    console.info("[Encounter] "+e._id+" Visitor["+e.visitorId+"] entered "+product+".");
  }

  var logNewEncounterToFirebase = function (encounter) {
    var installation = Installations.findOne(encounter.installationId);
    var data = { "type": "visit",
                 "location": installation.location_description(),
                 "enteredAt": encounter.enteredAt,
                 "exitedAt": encounter.exitedAt,
                 "sortedBy": encounter.enteredAt,
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
}

var visitCount = function(v) {
  return (v||[]).length;
}

Debug.location = function(_id) {
  var loaded = Locations.findOne({_id:_id});
  return "Location ["+loaded._id+"] ("+loaded.name+")"
}

Debug.observeMetrics = function() {
  var printNewMetric = function(m) {
    console.info("[Metric] "+m._id+" created for "+Debug.location(m.locationId)+" from "+m.enteredAt+" to "+m.exitedAt+".");
  };
  var printChangedMetric = function(n, o) {
    console.info("[Metric] "+n._id+" entranceVisits: "+visitCount(o.entranceVisitors)+" -> "+visitCount(n.entranceVisitors));
  };
  Metrics.find().observe({
    _suppress_initial: true,
    "added": function(newDoc) { printNewMetric(newDoc); },
    "changed": function(newDoc, oldDoc) { printChangedMetric(newDoc, oldDoc); }
  });
}

Debug.observeFunnels = function() {
  var ratio = function(f) {
    return visitCount(f.productVisitors)+"/"+visitCount(f.cashierVisitors);
  }
  var printChangedFunnel = function(n, o) {
    var installation = Installations.findOne({_id: n.installationId});
    var product = Debug.physical(installation.physicalId, installation.type);
    console.info("[Funnel] "+n._id+" ("+product+") productVisits/cashierVisits: "+ratio(o)+" -> "+ratio(n));
  };
  Funnels.find().observe({
    "changed": function(newDoc, oldDoc) { printChangedFunnel(newDoc, oldDoc); }
  });
}

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
