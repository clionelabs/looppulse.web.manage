Template.dashboard_segment_manage.helpers({
  counts: function(){
    console.log("this", this)
    return 7
  },
  segments: function(){
    var data = [
    { _id:"demo0001", name:"VIP", startTime: "", endTime: "", traceOffset: 100000, desc: "", sent:1000, viewed: 900, visited: 600, conversion: 0.6,viewConversion: 0.68  },
    { _id:"demo0002", name:"Summer Visitor", startTime: "", endTime: "", traceOffset: 100000, desc: "", sent:1200, viewed: 800,  visited: 600, conversion: 0.5, viewConversion: 0.75 },
    { _id:"demo0003", name:"Foodie", startTime: "", endTime: "", traceOffset: 100000, desc: "", sent:2000, viewed: 1200, visited: 400, conversion: 0.2,  viewConversion: 0.33 }

    ]
    var tmpl = Template.instance()
    var companyId = this.companyId
    var cursor = Segments.find({companyId: companyId}).fetch()
    console.log(tmpl, companyId, this, cursor)
    return cursor || data;
  },
  modal:function(){
    return {
      modalId: "collection-create-modal",
      context: "segment",
      collectionName: "Segments",
      fields:[{"name": "newItemName", "placeholder": "Enter a Segment name"}]
    }
  }
});

Template.dashboard_segment_create.helpers({
  criteriaInputs: function(companyId){
    //get All Locations under the company
    console.log("Generating...",companyId)
    var pairUp = function(o){
        var d = {}
        d[o.name] = o._id
        return d
    };

    var locationList = Locations.find({ companyId: companyId }).fetch().map(pairUp)
    var isDynamic = locationList.length > 1 ? true : false;
    //Locations.find({companyId: companyId}).fetch()
    //get All product and floor for each locations
    var floors = Floors.find({})
    var floorMap = Floors.find({}).fetch().map(pairUp)
    var productMap = Products.find({companyId: companyId}).fetch().map(pairUp)
    var categoryMap = Categories.find({companyId: companyId}).fetch().map(pairUp)
    console.log("All Maps", locationList, floorMap, productMap, categoryMap)
    if (locationList.length === 0 || floorMap.length === 0 || productMap.length === 0 || categoryMap.length === 0) {
      console.warn("Data not ready")
      return null
    } else {
      console.info("Data ready", this)
    }


    var prefix = "segmentCreateLocations";
    Session.set(prefix+"FloorMap", floorMap)
    Session.set(prefix+"ProductMap", productMap)
    Session.set(prefix+"CategoryMap", categoryMap)

    var plot = {
      "hasBeen": {
        "field": "hasBeen",
        "values": [{ "has been": true},{ "has not been":false}],
        "type": "list"
      },
      "to": {
        "field": "to",
        "values": ["any", "all"],
        "type": "list"
      },
      "triggerLocations": {
        "field":"triggerLocations",
        "filters": [
          {
            "key": "categoryName",
            "label": "category",
            "values": Session.get(prefix+"CategoryMap"),
            "style": "MultiSelect",
            "placeholder": "..."
          },
          {
            "key": "productName",
            "label": "product",
            "values": Session.get(prefix+"ProductMap"),
            "style": "MultiSelect",
            "placeholder": "..."
          },
          {
            "key": "floorLevel",
            "label": "floor",
            "values": Session.get(prefix+"FloorMap"), //when it is list, give me values
            "style": "MultiSelect",
            "placeholder": "..."
          }
        ],
        "type": "filterList"
      },
      "times":{
        "field":"times",
        "filters": [
          {
            "key": "atLeast",
            "label": "at least",
            "style": "Number",
            "placeholder": 1
          },
          {
            "key": "atMost",
            "label": "at most",
            "style": "Number",
            "placeholder": 99,
            "selected": true
          }
        ],
        "values":{ "atLeast":0, "atMost": 100 }, //label: value
        "type": "filterInput"
      },
      "durantionInMinutes":{
        "field":"durantionInMinutes",
        "filters": [
          {
            "key": "atLeast",
            "label": "at least",
            "style": "Number",
            "placeholder": 1,
            "selected": true
          },
          {
            "key": "atMost",
            "label": "at most",
            "placeholder": 90,
            "style": "Number"
          }
        ],
        "values": { "atLeast":0, "atMost": 1440 },
        "type": "filterInput"
      },
      "days":{
        "field": "days",
        "filters": [
          {
            "key": "dateTime",
            "label": "time period",
            "style": "DatetimeRange",
            "field": {"start":"start", "end":"end"} //special: anything needs extra field name
          },
          {
            "key": "inLast",
            "label": "last",
            "style": "Number",
            "selected": true
          }
        ],
        "type": "filterInput"
      },
      "every":{
        "field": "every",
        "values": ["day","weekdays", "weekends"],
        "type": "list"
      },
      "triggerPoints": {
        "field": "triggerPoints",
        "multiple": true,
        "values": locationList,
        "type": "list",
        "placeholder": "Locations...",
        "trigger": ".filter-list[data-key='triggerLocations']",
        "sessionKeyPrefix": prefix,
        "triggerDynamicUpdate": isDynamic
      }
    }
    this.plot = plot
    // Floors.find({locationId:locationId}, {fields:{_id:1, level: 1, name:1}}).fetch()
    return plot
  },

})
Template.dashboard_segment_create.events({
  "submit .rule-form": function(e,tmpl){
    var $form = $(e.currentTarget)
    var formData = $form.serializeObject()
    var plot = this.plot
    var fields = Object.keys(plot)
    var submitData = {}
    fields.forEach(function(f){
      var obj = formData[f];
      var o = {}
      var value;
      var key;
      if (!obj)
        throw Error("Missing field: "+ f)
      console.log("On", f, obj)
      // if (o._filter) {
      //   key = o[o._filter]
      //   value = o[key]
      //   submitData[f] = {}
      //   submitData[f][key] = value

      // } else {
      //   submitData[f] = o
      // }
      if (obj._filter) {
        key = obj._filter
        value = obj[key]
        o[key] = value
        submitData[f] = o
      }else{
        submitData[f] = obj
      }

    })
    console.log("Data Ready",submitData)
    // Submit to server
    return false;
  }
})
Template.dashboard_segment_create.destroyed = function(){
  //Unset session key here.
}
Template._field.helpers({
  isDefault: function(){
    return this.type !== "list" && this.type !== "filterList" && this.type !== "filterInput"
  },
  decompose: function(values){
    return values.map(function(o, i){
      if (typeof o === "object") {
        for (k in o) {
          return {
            key: k,
            val: o[k]+"",
            idx: i
          }
        }
      } else {
        return {
          key: o,
          val: o+"",
          idx: i
        }
      }
    })
  },
  isSelected: function(){
    return this.selected
  },
  isMultiple: function(){
    return this.multiple
  },
  isFirst: function(){
    return !isNaN(this.i) && this.idx === 0
  }
})
Template._field.rendered = function(){
  console.info("Rendered", this)
  var self = this;
  this.$('.input-daterange').datepicker({});

  this.$('.select-picker').selectpicker({});

  this.$('.select-picker').selectpicker('refresh')

  //data-filter-toggle changes -> data-filter toggle display
  //delegation
  //may be can save some data field
  var _selecting = function(elem){
    var selected = $("option:selected", elem)
    var targetField = selected.data("filter-toggle");
    var targetKey = $(elem).data("key")
    var type = $(elem).data("filter-type")
    var selector = ""
    var toggle = ""
    var present = ""
    var prefix = ""
    if (!targetField || !targetKey) { return false; }
    if (!type) {
      selector = ".filter-input-group[data-key='"+targetKey+"']"
      toggle = selector+"[data-filter='"+targetField+"']"
    } else {
      selector = ".filter-input-group.data-group-"+targetKey
      toggle = "div"+selector+".data-input-"+targetField
    }
    $(selector + ".visible").removeClass("visible").hide();
    $(toggle).addClass("visible").show();
  }

  var $select = this.$("select.select-filter")
  $select.on("change", function(e){
    _selecting(e.currentTarget)
  })
  this.$(".filter-input-group").hide();
  _selecting($select)



  if (this.data.trigger) {
   present = this.data.trigger
   prefix = this.data.sessionKeyPrefix
   console.log("present", present, this.$("select"))
   $(present).hide()
   this.$("select").change(function(){
    var selected = $("option:selected", this)
    console.log("Selected Location: ", selected)
    //do something with prefix
    //LocationsHelper.getCommonLocationMap(selected, prefix)

    $(present).show()
   })
  }
}

