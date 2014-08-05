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
  return description+"["+id+"] ("+loaded.name+")";
}

// We picked /visitors/visitor_uuid because client side generally does not
// know about the actual id of a visitor on our database.
Debug.visitorLogRef = function (visitorId) {
  var visitor = Visitors.findOne({ _id: visitorId });
  var fbPath = Meteor.settings.firebase.root;
  fbPath += "/visitors/" + visitor.uuid + "/logs";
  return new Firebase(fbPath);
}

Debug.logVisitorToFirebase = function (visitorId, data) {
  var debugConfig = Meteor.settings.DEBUG;
  if (debugConfig && debugConfig.logVisitorToFirebase) {
    var visitorRef = Debug.visitorLogRef(visitorId);
    visitorRef.push(data);
  }
}

Debug.observeEncouters = function() {
  var printNewEncounter = function(e) {
    var installation = Installations.findOne({_id: e.installationId});
    var product = Debug.physical(installation.physicalId, installation.type);
    console.info("[Encounter] Visitor["+e.visitorId+"] visited "+product+" from "+e.enteredAt+" to "+e.exitedAt+" for "+e.duration/1000+" seconds.");
  }

  var logNewEncounterToFirebase = function (encounter) {
    var installation = Installation.load({ _id: encounter.installationId });
    var data = { "type": "visit",
                 "location": installation.location_description(),
                 "enteredAt": encounter.enteredAt,
                 "exitedAt": encounter.exitedAt,
                 "sortedBy": encounter.exitedAt,
                 "durationInSeconds": encounter.duration/1000 };
    Debug.logVisitorToFirebase(encounter.visitorId, data);
  };

  Encounter.findClosed().observe({
    "added": function(newDoc) { printNewEncounter(newDoc);
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


Debug.observeMessages = function () {
  var printNewMessage = function (message) {
    console.info("[Message] Delivered to Visitor[" + message.visitorId + "]: '" +
                 message.body + "' due to Engagement[" + message.engagementId + "]");
  }

  var logNewMessageToFirebase = function (message) {
    var data = { "type": "message",
                 "body": message.body,
                 "sortedBy": message.createdAt,
                 "createdAt": message.createdAt};
    Debug.logVisitorToFirebase(message.visitorId, data);
  }

  Messages.find().observe({
    "added": function(newMessage) { printNewMessage(newMessage);
                                    logNewMessageToFirebase(newMessage); }
  })
}
