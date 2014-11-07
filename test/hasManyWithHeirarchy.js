define([
  "source/ember-utils-core",
], function(Utils) {

return function() {

module("Utils.hasManyWithHierarchy");

test("2 Levels of hierarchy", function() {
  Ember.hierarchy = [
    {
      classes : {
        base00 : Ember.Object.extend({vara : "level0-base0", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
        base01 : Ember.Object.extend({vara : "level0-base1", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
      },
      base : "base00",
      keysInArray : ["type", "children0", "varb", "varc"],
      childrenKey : "children0",
    },
    {
      classes : {
        base10 : Ember.Object.extend({vara : "level1-base0"}),
        base11 : Ember.Object.extend({vara : "level1-base1"}),
      },
      base : "base10",
      keysInArray : ["type", "varb", "varc"],
    },
  ];
  Utils.registerHierarchy(Ember.hierarchy);
  var objClass = Ember.Object.extend({
    children : Utils.hasManyWithHierarchy("Ember.hierarchy", 0, "type"),
  });

  var assertions = [{
    input : [{
      type : "base01",
      varb : "varb0",
      varc : "varc0",
    }],
    output : [{
      vara : "level0-base1",
      varb : "varb0",
      varc : "varc0",
    }],
  },
  {
    input : [{
      type : "base10",
      varb : "varb0",
      varc : "varc0",
    }],
    output : [{
      vara : "level0-base0",
      children0 : [
        {
          vara : "level1-base0",
          varb : "varb0",
          varc : "varc0",
        },
      ],
    }],
  },
  {
    input : [{
      type : "base10",
      varb : "varb0",
      varc : "varc0",
    },
    {
      type : "base01",
      varb : "varb1",
      varc : "varc1",
      children0 : [
        {
          type : "base11",
          varb : "varb2",
          varc : "varc2",
        },
      ],
    }],
    output : [{
      vara : "level0-base0",
      children0 : [
        {
          vara : "level1-base0",
          varb : "varb0",
          varc : "varc0",
        },
      ],
    },
    {
      vara : "level0-base1",
      varb : "varb1",
      varc : "varc1",
      children0 : [
        {
          vara : "level1-base1",
          varb : "varb2",
          varc : "varc2",
        },
      ],
    }],
  }, {
    input : [
      ["base00", [], "varb0", "varc0"],
      ["base01", [], "varb1", "varc1"],
    ],
    output : [{
      vara : "level0-base0",
      varb : "varb0",
      varc : "varc0",
    }, {
      vara : "level0-base1",
      varb : "varb1",
      varc : "varc1",
    }],
  }, {
    input : [
      ["base10", "varb0", "varc0"],
      ["base11", "varb1", "varc1"],
    ],
    output : [{
      vara : "level0-base0",
      children0 : [{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }, {
        vara : "level1-base1",
        varb : "varb1",
        varc : "varc1",
      }],
    }],
  }, {
    input : [
      ["base10", "varb0", "varc0"],
      ["base01", [
        ["base11", "varb1", "varc1"],
      ]],
    ],
    output : [{
      vara : "level0-base0",
      children0 : [{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }],
    }, {
      vara : "level0-base1",
      children0 : [{
        vara : "level1-base1",
        varb : "varb1",
        varc : "varc1",
      }],
    }],
  }];

  for(var i = 0; i < assertions.length; i++) {
    var c = objClass.create({
      children : assertions[i].input,
    });
    ok(Utils.emberDeepEqual( c.get("children"), assertions[i].output ));
  }
});

test("3 Levels of hierarchy", function() {
  Ember.hierarchy = [
    {
      classes : {
        base00 : Ember.Object.extend({vara : "level0-base0", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
        base01 : Ember.Object.extend({vara : "level0-base1", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
      },
      base : "base00",
      keysInArray : ["type", "children0", "varb", "varc"],
      childrenKey : "children0",
    },
    {
      classes : {
        base10 : Ember.Object.extend({vara : "level1-base0", children1 : Utils.hasManyWithHierarchy("Ember.hierarchy", 2, "type")}),
        base11 : Ember.Object.extend({vara : "level1-base1", children1 : Utils.hasManyWithHierarchy("Ember.hierarchy", 2, "type")}),
      },
      base : "base10",
      keysInArray : ["type", "children1", "varb", "varc"],
      childrenKey : "children1",
    },
    {
      classes : {
        base20 : Ember.Object.extend({vara : "level2-base0"}),
        base21 : Ember.Object.extend({vara : "level2-base1"}),
      },
      base : "base20",
      keysInArray : ["type", "varb", "varc"],
    },
  ];
  Utils.registerHierarchy(Ember.hierarchy);
  var objClass = Ember.Object.extend({
    children : Utils.hasManyWithHierarchy("Ember.hierarchy", 0, "type"),
  });

  var assertions = [{
    input : [
      ["base10", [], "varb0", "varc0"],
      ["base21", "varb1", "varc1"],
      ["base11", [], "varb2", "varc2"],
    ],
    output : [{
      vara : "level0-base0",
      children0 : [{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }, {
        vara : "level1-base0",
        children1 : [{
          vara : "level2-base1",
          varb : "varb1",
          varc : "varc1",
        }],
      }, {
        vara : "level1-base1",
        varb : "varb2",
        varc : "varc2",
      }],
    }],
  }, {
    input : [
      ["base01", [], "varb0", "varc0"],
      ["base10", [], "varb1", "varc1"],
    ],
    output : [{
      vara : "level0-base1",
      varb : "varb0",
      varc : "varc0",
    }, {
      vara : "level0-base0",
      children0 : [{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }],
    }],
  }, {
    input : [
      ["base10", [], "varb0", "varc0"],
      ["base01", [], "varb1", "varc1"],
    ],
    output : [{
      vara : "level0-base0",
      children0 : [{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }],
    }, {
      vara : "level0-base1",
      varb : "varb1",
      varc : "varc1",
    }],
  }];

  for(var i = 0; i < assertions.length; i++) {
    var c = objClass.create({
      children : assertions[i].input,
    });
    ok(Utils.emberDeepEqual( c.get("children"), assertions[i].output ));
  }
});

test("Utils.addToHierarchy", function() {
  Ember.hierarchy = [
    {
      classes : {
        base00 : Ember.Object.extend({vara : "level0-base0", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
        base01 : Ember.Object.extend({vara : "level0-base1", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
      },
      base : "base00",
      keysInArray : ["type", "children0", "varb", "varc"],
      childrenKey : "children0",
    },
    {
      classes : {
        base10 : Ember.Object.extend({vara : "level1-base0", children1 : Utils.hasManyWithHierarchy("Ember.hierarchy", 2, "type")}),
        base11 : Ember.Object.extend({vara : "level1-base1", children1 : Utils.hasManyWithHierarchy("Ember.hierarchy", 2, "type")}),
      },
      base : "base10",
      keysInArray : ["type", "children1", "varb", "varc"],
      childrenKey : "children1",
    },
    {
      classes : {
        base20 : Ember.Object.extend({vara : "level2-base0"}),
        base21 : Ember.Object.extend({vara : "level2-base1"}),
      },
      base : "base20",
      keysInArray : ["type", "varb", "varc"],
    },
  ];
  Utils.registerHierarchy(Ember.hierarchy);
  var objClass = Ember.Object.extend({
    children : Utils.hasManyWithHierarchy("Ember.hierarchy", 0, "type"),
  });

  var assertions = [{
    input : {
      type : "base02",
      classObj : Ember.Object.extend({vara : "level0-base2", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 1, "type")}),
      level : 0,
      create : [
        ["base02", [], "varb0", "varc0"],
      ],
    },
    output : [{
      vara : "level0-base2",
      varb : "varb0",
      varc : "varc0",
    }],
  }, {
    input : {
      type : "base12",
      classObj : Ember.Object.extend({vara : "level1-base2", children0 : Utils.hasManyWithHierarchy("Ember.hierarchy", 2, "type")}),
      level : 1,
      create : [
        ["base12", [], "varb0", "varc0"],
      ],
    },
    output : [{
      vara : "level0-base0",
      children0 : [{
        vara : "level1-base2",
        varb : "varb0",
        varc : "varc0",
      }],
    }],
  }];

  for(var i = 0; i < assertions.length; i++) {
    Utils.addToHierarchy(Ember.hierarchy, assertions[i].input.type, assertions[i].input.classObj, assertions[i].input.level);
    equal(Ember.hierarchy[assertions[i].input.level].classes[assertions[i].input.type], assertions[i].input.classObj);
    var c = objClass.create({
      children : assertions[i].input.create,
    });
    ok(Utils.emberDeepEqual( c.get("children"), assertions[i].output ));
  }
});

};

});
