// TODO legacy code, rewrite them
Template.segmentCreate.events({
  'change [name="hasBeen"]': function (e, tmpl) {
    console.log(e, $(e.currentTarget).val());
    if ($(e.currentTarget).val() === 'true') {
      $('#times_and_duration').removeClass('hide');
    } else {
      $('#times_and_duration').addClass('hide');
    }
  },
  "click .create-btn": function (e, tmpl) {
    try {
      $('.rule-form').submit();
    } catch (e) {
      console.error(e);
      Notifications.error("Error", e.message);
    }
  },
  "click .done-btn[data-key='triggerLocations'] ": function (e, tmpl) {
    e.preventDefault();
    e.stopPropagation();
    console.log(this);
    $(".data-group-triggerLocations.visible .dropdown-menu li:not(.selected)").hide();
    // $(".data-group-triggerLocations.visible btn.dropdown-toggle").hide();
    $(".edit-btn[data-key='triggerLocations']").removeClass("hidden").show();
    $(e.currentTarget).hide();
    return false;
  },
  "click .edit-btn[data-key='triggerLocations']": function (e, tmpl) {
    $(e.currentTarget).hide();
    $(".done-btn[data-key='triggerLocations']").show();
    // $(".data-group-triggerLocations.visible btn.dropdown-toggle").show();
    $(".data-group-triggerLocations.visible .dropdown-menu li:not(.selected)").show();
  },
  'click .main-filter[data-key="triggerLocations"] .main-selector': function (e, tmpl) {
    console.log("clicked", e);

    $(".edit-btn[data-key='triggerLocations']").hide();
    $(".done-btn[data-key='triggerLocations']").show();
    $(".data-group-triggerLocations.visible .dropdown-menu li:not(.selected)").show();
  },
  "submit .rule-form": function (e, tmpl) {
    var self = this;
    var $form = $(e.currentTarget);
    var formData = $form.serializeObject();
    var plot = this.plot;
    var fields = Object.keys(plot);
    var submitData = {
      "companyId": self.companyId,
      "name": null,
      "criteria": null
    };

    //Data Translation
    $("input[data-type='datetime']").each(function () {
      var $elem = $(this);
      //@@WARN: timezone ignored
      $elem.val(new Date($elem.val()).toISOString());
    });

    //Process other field first
    submitData.name = $("input[name='segments.name']").val();
    if (!submitData.name) { // and other validation...
      throw Error("Missing Segment Name");
    }

    //May be we need to check companyId too...

    //criteria
    var criteriaData = {};
    var filtering = function (obj) {
      var o = {};
      var value;
      var key;
      if (obj._filter) {
        key = obj._filter;
        value = obj[key];
        o[key] = value;
      } else {
        o = obj;
      }
      return o;
    };

    fields.forEach(function (f) {
      var obj = formData[f];
      var schema = plot[f];
      var arr;
      var type = schema ? schema.type : "";
      if (!obj) {
        throw Error("Missing field: " + f);
      }
      if (type === "filterList" && _.isArray(obj)) {
        arr = obj.map(function (elem) {
          return filtering(elem);
        });
        criteriaData[f] = arr;
      } else {
        criteriaData[f] = filtering(obj);
      }
    });

    submitData.criteria = criteriaData;
    console.log("Data Ready", submitData);
    Meteor.call("createInCollection", "Segments", submitData, function (err, res) {
      var segmentId = res;
      if (err) {
        console.error(err);
        Notifications.error("Segment", "Segment Creation failed -- " + err + " --");
      } else {
        console.info(res);
        Notifications.success("Segment", "Segment Created (" + segmentId + ")");
        Router.go('segment.detail', { segmentId: segmentId });
      }
    });
    // Submit to server
    return false;
  }
});

Template.segmentCreate.helpers({
  criteriaInputs: function () {
    var self = this;
    var companyId = self.companyId;

    //get All Locations under the company
    // console.log("Generating...",companyId)
    var pairUp = function (o) {
      var d = {};
      d[o.name] = o._id;
      return d
    };

    var locationList = Locations.find({ companyId: companyId }).fetch().map(pairUp);
    var isDynamic = (locationList.length > 1);
    //Locations.find({companyId: companyId}).fetch()
    //get All product and floor for each locations
    var floors = Floors.find({});
    var floorMap = Floors.find({}).fetch().map(pairUp);
    var productMap = Products.find({companyId: companyId}).fetch().map(pairUp);
    var categoryMap = Categories.find({companyId: companyId}).fetch().map(pairUp);
    // console.log("All Maps", locationList, floorMap, productMap, categoryMap)
    if (locationList.length === 0
      || floorMap.length === 0
      || productMap.length === 0
      || categoryMap.length === 0) {
      console.warn("Data not ready");
      return null;
    } else {
      console.info("Data ready", this);
    }

    var prefix = "segmentCreateLocations";
    Session.set(prefix + "FloorMap", floorMap);
    Session.set(prefix + "ProductMap", productMap);
    Session.set(prefix + "CategoryMap", categoryMap);

    var plot = {
      "hasBeen": {
        "field": "hasBeen",
        "values": [
          { "been": true},
          { "not been": false}
        ],
        "type": "list"
      },
      "to": {
        "field": "to",
        "values": ["any", "all"],
        "type": "list"
      },
      "triggerLocations": {
        "field": "triggerLocations",
        "filters": [
          {
            "key": "categoryId",
            "label": "category",
            "values": Session.get(prefix + "CategoryMap"),
            "style": "MultiSelect",
            "placeholder": "..."
          },
          {
            "key": "productId",
            "label": "product",
            "values": Session.get(prefix + "ProductMap"),
            "style": "MultiSelect",
            "placeholder": "..."
          },
          {
            "key": "floorLevel",
            "label": "floor",
            "values": Session.get(prefix + "FloorMap"), //when it is list, give me values
            "style": "MultiSelect",
            "placeholder": "..."
          }
        ],
        "baseIndex": 0,
        "placeholder": "Pick One",
        "filterClass": "filter-item-list",
        "trigger": ".filter-item-list[data-key='triggerLocations']",
        "filteredTextFormat": "count",
        "type": "filterList"
      },
      "times": {
        "field": "times",
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
        "values": { "atLeast": 0, "atMost": 100 }, //label: value
        "type": "filterInput"
      },
      "durationInMinutes": {
        "field": "durationInMinutes",
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
        "values": { "atLeast": 0, "atMost": 1440 },
        "type": "filterInput"
      },
      "days": {
        "field": "days",
        "filters": [
          {
            "key": "dateTime",
            "label": "time period",
            "style": "DatetimeRange",
            "field": {"start": "start", "end": "end"} //special: anything needs extra field name
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
      "every": {
        "field": "every",
        "values": ["day", "weekdays", "weekends"],
        "type": "list"
      },
      "triggerPoints": {
        "field": "triggerPoints",
        "multiple": true,
        "values": locationList,
        "type": "list",
        "placeholder": "Locations...",
        "trigger": ".filter-list.main-filter[data-key='triggerLocations']",
        "sessionKeyPrefix": prefix,
        "triggerDynamicUpdate": isDynamic
      }
    };
    this.plot = plot;
    // Floors.find({locationId:locationId}, {fields:{_id:1, level: 1, name:1}}).fetch()
    return plot;
  }
});

Template._field.helpers({
  decompose: function (values) {
    return values.map(function (o, i) {
      if (typeof o === "object") {
        for (k in o) {
          return {
            key: k,
            val: o[k] + "",
            idx: i
          }
        }
      } else {
        return {
          key: o,
          val: o + "",
          idx: i
        }
      }
    })
  },
  equals: function (a, b) {
    return a + "" === b + "";
  },
  getName: function (name) {
    if (!_.isString(name)) {
      return null;
    }
    // console.log("Naming", arguments, this)
    // Note: the first is the base name, the last is the argument hash
    var key;
    for (var i = 1, length = arguments.length - 1; i < length; i++) {
      key = arguments[i];
      if (_.isBoolean(key) && key) {
        key = "";
      }
      if (!isNaN(key)) { //only a number shall pass. undefined/null, gone.
        key += "";  //cast to string
      }
      if (_.isString(key)) {
        name += "[" + key + "]";
      }
    }
    return name;
  },
  isDefault: function () {
    return this.type !== "list" && this.type !== "filterList" && this.type !== "filterInput";
  },
  isFirst: function () {
    return !this.notSelected ? (!isNaN(this.i) && this.idx === 0) : false;
  },
  isMultiple: function () {
    return this.multiple;
  },
  isSelected: function () {
    console.log("isSelected?", !this.notSelected ? this.selected : false);
    return !this.notSelected ? this.selected : false;
  }
});

Template._field.rendered = function () {
  // console.info("Rendered", this)
  var self = this;
  var present;
  var $select;

  //data-filter-toggle changes -> data-filter toggle display
  //may be can save some data field
  var _selecting = function (elem) {
    var selected = $("option:selected", elem);
    var targetField = selected.data("filter-toggle");
    var targetKey = $(elem).data("key");
    var type = $(elem).data("filter-type");
    var selector = "";
    var toggle = "";
    if (!targetField || !targetKey) {
      return false;
    }
    if (!type) {
      selector = ".filter-input-group[data-key='" + targetKey + "']";
      toggle = selector + "[data-filter='" + targetField + "']";
    } else {
      selector = ".filter-input-group.data-group-" + targetKey;
      toggle = "" + selector + ".data-input-" + targetField;
    }
    console.log("selector", selector, toggle);
    console.log("set?", type);
    $(selector + ".visible").removeClass("visible").hide();

    if (type === "select") {
      $("select" + toggle).val([]).selectpicker("refresh");
      console.info("Filtered List reset: " + toggle);
      toggle = "div" + toggle;
    }
    if (toggle) {
      $(toggle).addClass("visible").show();
    }
  }

  this.$('.input-daterange').datepicker({});

  this.$('.select-picker').selectpicker({});

  // this.$('.select-picker').selectpicker('refresh');

  $select = this.$("select.select-filter");
  $select.on("change", function (e) {
    _selecting(e.currentTarget);
  });
  this.$(".filter-input-group").hide();
  _selecting($select);

  if (this.data.trigger) {
    present = this.data.trigger;
    console.log("Hiding ", present);
    $(present).hide();
    this.$("select.main-selector").change(function () {
      var selected = $("option:selected", this);
      console.log("Selected ", selected, "; Showing", present);
      //do something with prefix
      //LocationsHelper.getCommonLocationMap(selected, prefix);

      $(present).show();
    });
  }
};
