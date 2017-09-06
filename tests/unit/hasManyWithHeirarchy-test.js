import Ember from "ember";
import EmberObjectUtils from "ember-object-utils";
import { module, test } from "qunit";

function emberDeepEqual(src, tar) {
  for(var k in tar) {
    var kObj = src.get(k);
    if(Ember.typeOf(tar[k]) === "object" || Ember.typeOf(tar[k]) === "instance") {
      return emberDeepEqual(kObj, tar[k]);
    }
    else if(Ember.typeOf(tar[k]) === "array") {
      for(var i = 0; i < tar[k].length; i++) {
        if(!emberDeepEqual(kObj.objectAt(i), tar[k][i])) {
          return false;
        }
      }
    }
    else if(tar[k] !== kObj) {
      console.log(kObj + " not equal to " + tar[k] + " for key : " + k);
      return false;
    }
  }
  return true;
}

module("EmberObjectUtils.hasManyWithHierarchy");

test("2 Levels of hierarchy", function(assert) {
  var objClass = Ember.Object.extend({
    children : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 0, "type"),
  }),
  base00 = Ember.Object.extend({
    vara : "level0-base0",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")
  }),
  base01 = Ember.Object.extend({
    vara : "level0-base1",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")
  });
  base00.hierarchy = base01.hierarchy = objClass.hierarchy = [
    {
      classes : {
        base00 : base00,
        base01 : base01,
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
  EmberObjectUtils.registerHierarchy(objClass.hierarchy);

  var assertions = [{
    input : Ember.A([{
      type : "base01",
      varb : "varb0",
      varc : "varc0",
    }]),
    output : Ember.A([{
      vara : "level0-base1",
      varb : "varb0",
      varc : "varc0",
    }]),
  },
  {
    input : Ember.A([{
      type : "base10",
      varb : "varb0",
      varc : "varc0",
    }]),
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([
        {
          vara : "level1-base0",
          varb : "varb0",
          varc : "varc0",
        },
      ]),
    }]),
  },
  {
    input : Ember.A([{
      type : "base10",
      varb : "varb0",
      varc : "varc0",
    },
    {
      type : "base01",
      varb : "varb1",
      varc : "varc1",
      children0 : Ember.A([
        {
          type : "base11",
          varb : "varb2",
          varc : "varc2",
        },
      ]),
    }]),
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([
        {
          vara : "level1-base0",
          varb : "varb0",
          varc : "varc0",
        },
      ]),
    },
    {
      vara : "level0-base1",
      varb : "varb1",
      varc : "varc1",
      children0 : Ember.A([
        {
          vara : "level1-base1",
          varb : "varb2",
          varc : "varc2",
        },
      ]),
    }]),
  }, {
    input : Ember.A([
      Ember.A(["base00", Ember.A([]), "varb0", "varc0"]),
      Ember.A(["base01", Ember.A([]), "varb1", "varc1"]),
    ]),
    output : Ember.A([{
      vara : "level0-base0",
      varb : "varb0",
      varc : "varc0",
    }, {
      vara : "level0-base1",
      varb : "varb1",
      varc : "varc1",
    }]),
  }, {
    input : Ember.A([
      Ember.A(["base10", "varb0", "varc0"]),
      Ember.A(["base11", "varb1", "varc1"]),
    ]),
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }, {
        vara : "level1-base1",
        varb : "varb1",
        varc : "varc1",
      }]),
    }]),
  }, {
    input : Ember.A([
      Ember.A(["base10", "varb0", "varc0"]),
      Ember.A(["base01", Ember.A([
        Ember.A(["base11", "varb1", "varc1"]),
      ])]),
    ]),
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }]),
    }, {
      vara : "level0-base1",
      children0 : Ember.A([{
        vara : "level1-base1",
        varb : "varb1",
        varc : "varc1",
      }]),
    }]),
  }];

  for(var i = 0; i < assertions.length; i++) {
    var c = objClass.create({
      children : assertions[i].input,
    });
    assert.ok(emberDeepEqual( c.get("children"), assertions[i].output ));
  }
});

test("3 Levels of hierarchy", function(assert) {
  var objClass = Ember.Object.extend({
    children : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 0, "type"),
  }),
  base00 = Ember.Object.extend({
    vara : "level0-base0",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")
  }),
  base01 = Ember.Object.extend({
    vara : "level0-base1",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")
  }),
  base10 = Ember.Object.extend({
    vara : "level1-base0",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 2, "type")
  }),
  base11 = Ember.Object.extend({
    vara : "level1-base1",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 2, "type")
  });
  base00.hierarchy = base01.hierarchy = base10.hierarchy = base11.hierarchy = objClass.hierarchy = [
    {
      classes : {
        base00 : base00,
        base01 : base01,
      },
      base : "base00",
      keysInArray : ["type", "children0", "varb", "varc"],
      childrenKey : "children0",
    },
    {
      classes : {
        base10 : base10,
        base11 : base11,
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
  EmberObjectUtils.registerHierarchy(objClass.hierarchy);

  var assertions = [{
    input : Ember.A([
      Ember.A(["base10", Ember.A([]), "varb0", "varc0"]),
      Ember.A(["base21", "varb1", "varc1"]),
      Ember.A(["base11", Ember.A([]), "varb2", "varc2"]),
    ]),
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }, {
        vara : "level1-base0",
        children1 : Ember.A([{
          vara : "level2-base1",
          varb : "varb1",
          varc : "varc1",
        }]),
      }, {
        vara : "level1-base1",
        varb : "varb2",
        varc : "varc2",
      }]),
    }]),
  }, {
    input : Ember.A([
      Ember.A(["base01", Ember.A([]), "varb0", "varc0"]),
      Ember.A(["base10", Ember.A([]), "varb1", "varc1"]),
    ]),
    output : Ember.A([{
      vara : "level0-base1",
      varb : "varb0",
      varc : "varc0",
    }, {
      vara : "level0-base0",
      children0 : Ember.A([{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }]),
    }]),
  }, {
    input : Ember.A([
      Ember.A(["base10", Ember.A([]), "varb0", "varc0"]),
      Ember.A(["base01", Ember.A([]), "varb1", "varc1"]),
    ]),
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([{
        vara : "level1-base0",
        varb : "varb0",
        varc : "varc0",
      }]),
    }, {
      vara : "level0-base1",
      varb : "varb1",
      varc : "varc1",
    }]),
  }];

  for(var i = 0; i < assertions.length; i++) {
    var c = objClass.create({
      children : assertions[i].input,
    });
    assert.ok(emberDeepEqual( c.get("children"), assertions[i].output ));
  }
});

test("EmberObjectUtils.addToHierarchy", function(assert) {
  var objClass = Ember.Object.extend({
    children : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 0, "type"),
  }),
  base00 = Ember.Object.extend({
    vara : "level0-base0",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")
  }),
  base01 = Ember.Object.extend({
    vara : "level0-base1",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")
  }),
  base10 = Ember.Object.extend({
    vara : "level1-base0",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 2, "type")
  }),
  base11 = Ember.Object.extend({
    vara : "level1-base1",
    children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 2, "type")
  });
  base00.hierarchy = base01.hierarchy = base10.hierarchy = base11.hierarchy = objClass.hierarchy = [
    {
      classes : {
        base00 : base00,
        base01 : base01,
      },
      base : "base00",
      keysInArray : ["type", "children0", "varb", "varc"],
      childrenKey : "children0",
    },
    {
      classes : {
        base10 : base10,
        base11 : base11,
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
  EmberObjectUtils.registerHierarchy(objClass.hierarchy);

  var assertions = [{
    input : {
      type : "base02",
      classObj : Ember.Object.extend({vara : "level0-base2", children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 1, "type")}),
      level : 0,
      create : Ember.A([
        Ember.A(["base02", Ember.A([]), "varb0", "varc0"]),
      ]),
    },
    output : Ember.A([{
      vara : "level0-base2",
      varb : "varb0",
      varc : "varc0",
    }]),
  }, {
    input : {
      type : "base12",
      classObj : Ember.Object.extend({vara : "level1-base2", children0 : EmberObjectUtils.hasManyWithHierarchy("constructor.hierarchy", 2, "type")}),
      level : 1,
      create : Ember.A([
        Ember.A(["base12", Ember.A([]), "varb0", "varc0"]),
      ]),
    },
    output : Ember.A([{
      vara : "level0-base0",
      children0 : Ember.A([{
        vara : "level1-base2",
        varb : "varb0",
        varc : "varc0",
      }]),
    }]),
  }];

  for(var i = 0; i < assertions.length; i++) {
    assertions[i].input.classObj.hierarchy = objClass.hierarchy;
    EmberObjectUtils.addToHierarchy(objClass.hierarchy, assertions[i].input.type, assertions[i].input.classObj, assertions[i].input.level);
    assert.equal(objClass.hierarchy[assertions[i].input.level].classes[assertions[i].input.type], assertions[i].input.classObj);
    var c = objClass.create({
      children : assertions[i].input.create,
    });
    assert.ok(emberDeepEqual( c.get("children"), assertions[i].output ));
  }
});
