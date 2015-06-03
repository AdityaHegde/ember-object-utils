import Ember from "ember";
import EmberObjectUtils from "ember-object-utils";
import { module, test } from "qunit";

module("EmberObjectUtils.objectWithArrayMixin");

/* jshint ignore:start */
function setupObjectWithArrayMixin() {
  var 
  setup = {
    deletedEles : null, deletedIdxs : null, deletedSpecific : null,
    canAddEle : null, canAddIdx : null, canAddSpecific : null,
    addedEles : null, addedIdxs : null, addedSpecific : null,
  },
  classObj = Ember.Object.extend(EmberObjectUtils.ObjectWithArrayMixin, {
    arrayProps : ["var0", "var1", "var2", "var3"],
    var0 : null,
    var1 : null,
    var2 : null,
    var3 : null,

    var0WillBeDeleted : function(eles, idxs) {
      setup.deletedEles = eles;
      setup.deletedIdxs = idxs;
      setup.deletedSpecific = 1;
    },
    var0CanAdd : function(ele, idx) {
      setup.canAddEle = ele;
      setup.canAddIdx = idx;
      setup.canAddSpecific = 1;
      return !ele.get("vara");
    },
    var0WasAdded : function(eles, idxs) {
      setup.addedEles = eles;
      setup.addedIdxs = idxs;
      setup.addedSpecific = 1;
    },
    var1WillBeDeleted : function(eles, idxs) {
      setup.deletedEles = eles;
      setup.deletedIdxs = idxs;
      setup.deletedSpecific = 1;
    },
    var1CanAdd : function(ele, idx) {
      setup.canAddEle = ele;
      setup.canAddIdx = idx;
      setup.canAddSpecific = 1;
      return !ele.get("vara");
    },
    var1WasAdded : function(eles, idxs) {
      setup.addedEles = eles;
      setup.addedIdxs = idxs;
      setup.addedSpecific = 1;
    },
    propWillBeDeleted : function(eles, idxs) {
      setup.deletedEles = eles;
      setup.deletedIdxs = idxs;
      setup.deletedSpecific = 0;
    },
    propCanAdd : function(ele, idx) {
      setup.canAddEle = ele;
      setup.canAddIdx = idx;
      setup.canAddSpecific = 0;
      return !ele.get("vara");
    },
    propWasAdded : function(eles, idxs) {
      setup.addedEles = eles;
      setup.addedIdxs = idxs;
      setup.addedSpecific = 0;
    },
  }),
  class0Obj = Ember.Object.extend({
    varc : "c0",
  }),
  class1Obj = Ember.Object.extend({
    varc : "c1",
  }),
  class2Obj = Ember.Object.extend({
    varc : "c2",
  }),
  class3Obj = Ember.Object.extend({
    varc : "c3",
  });
  setup.classes = [class0Obj, class1Obj, class2Obj, class3Obj];
  setup.obj = classObj.create();
  return setup;
}

test("objectWithArrayMixin, single add to an empty array", function(assert) {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    singleCreate = setup.classes[i].create();

    Ember.run(function() {
      setup.obj.get(vari).pushObject(singleCreate);
    });

    assert.equal(setup.canAddEle, singleCreate, "canAddEle for "+i);
    assert.equal(setup.canAddIdx, 0, "canAddIdx for "+i);
    assert.equal(setup.canAddSpecific, i < 2 ? 1 : 0, "canAddSpecific for "+i);
    assert.equal(setup.addedEles[0], singleCreate, "addedEles for "+i);
    assert.equal(setup.addedIdxs[0], 0, "addedIdxs for "+i);
    assert.equal(setup.addedSpecific, i < 2 ? 1 : 0, "addedSpecific for "+i);
    assert.equal(setup.obj.get(varil), 1, "var"+i+" length");
  }
});

test("objectWithArrayMixin, single add to a non empty array", function(assert) {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    singleCreate = setup.classes[i].create();

    Ember.run(function() {
      for(var j = 0; j < 3; j++) {
        setup.obj.get(vari).pushObject(setup.classes[i].create());
      }
      setup.obj.get(vari).insertAt(1, singleCreate);
    });

    assert.equal(setup.canAddEle, singleCreate, "canAddEle for "+i);
    assert.equal(setup.canAddIdx, 1, "canAddIdx for "+i);
    assert.equal(setup.canAddSpecific, i < 2 ? 1 : 0, "canAddSpecific for "+i);
    assert.equal(setup.addedEles[0], singleCreate, "addedEles for "+i);
    assert.equal(setup.addedIdxs[0], 1, "addedIdxs for "+i);
    assert.equal(setup.addedSpecific, i < 2 ? 1 : 0, "addedSpecific for "+i);
    assert.equal(setup.obj.get(varil), 4, "var"+i+" length");
  }
});

test("objectWithArrayMixin, multiple add to an array", function(assert) {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length", j = i, objs;

    Ember.run(function() {
      objs = Ember.A([setup.classes[i].create(), setup.classes[i].create({vara : 1}), setup.classes[i].create()]);
      setup.obj.get(vari).pushObjects(objs);
    });

    objs.removeAt(1);
    assert.deepEqual(setup.addedEles, objs, "addedEles for "+j);
    assert.deepEqual(setup.addedIdxs, [0, 2], "addedIdxs for "+j);
    assert.equal(setup.addedSpecific, j < 2 ? 1 : 0, "addedSpecific for "+j);
    assert.equal(setup.obj.get(varil), 2, "var"+j+" length");
  }
});

test("objectWithArrayMixin, delete from an array", function(assert) {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    deleted;

    Ember.run(function() {
      for(var j = 0; j < 3; j++) {
        setup.obj.get(vari).pushObject(setup.classes[i].create());
      }
      deleted = setup.obj.get(vari).objectAt(1);
      setup.obj.get(vari).removeAt(1);
    });

    assert.equal(setup.deletedEles[0], deleted, "deletedEles for "+i);
    assert.equal(setup.deletedIdxs[0], 1, "deletedIdxs for "+i);
    assert.equal(setup.deletedSpecific, i < 2 ? 1 : 0, "deletedSpecific for "+i);
    assert.equal(setup.obj.get(varil), 2, "var"+i+" length");
  }
});

test("objectWithArrayMixin, changing array", function(assert) {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    oldArr, newArr;

    Ember.run(function() {
      for(var j = 0; j < 3; j++) {
        setup.obj.get(vari).pushObject(setup.classes[i].create());
      }
      oldArr = setup.obj.get(vari);
      newArr = Ember.A([setup.classes[i].create(), setup.classes[i].create(), setup.classes[i].create()]);
      setup.obj.set(vari, newArr);
    });

    assert.deepEqual(setup.deletedEles, oldArr, "deletedEles for array change");
    assert.deepEqual(setup.deletedIdxs, [0, 1, 2], "deletedIdxs for array change");
    assert.equal(setup.deletedSpecific, i < 2 ? 1 : 0, "deletedSpecific for array change");
    assert.deepEqual(setup.addedEles, newArr, "addedEles for array change");
    assert.deepEqual(setup.addedIdxs, [0, 1, 2], "addedIdxs for array change");
    assert.equal(setup.addedSpecific, i < 2 ? 1 : 0, "addedSpecific for array change");
    assert.equal(setup.obj.get(varil), 3, "var"+i+" length");
  }
});

test("objectWithArrayMixin, dynamic arrayProps", function(assert) {
  var setup = setupObjectWithArrayMixin(), singleCreate;

  setup.canAddEle = setup.canAddIdx = setup.canAddSpecific = null;
  setup.addedEles = setup.addedIdxs = setup.addedSpecific = null;

  Ember.run(function() {
    setup.obj.get("arrayProps").removeAt(0);
  });

  Ember.run(function() {
    setup.obj.get("var0").pushObject(setup.classes[0].create());
  });

  assert.equal(setup.canAddEle, null);
  assert.equal(setup.canAddIdx, null);
  assert.equal(setup.canAddSpecific, null);
  assert.equal(setup.addedEles, null);
  assert.equal(setup.addedIdxs, null);
  assert.equal(setup.addedSpecific, null);

  Ember.run(function() {
    setup.obj.get("arrayProps").pushObject("var4");
  });

  Ember.run(function() {
    singleCreate = setup.classes[0].create();
    setup.obj.get("var4").pushObject(singleCreate);
  });

  assert.equal(setup.canAddEle, singleCreate, "canAddEle var4");
  assert.equal(setup.canAddIdx, 0, "canAddIdx var4");
  assert.equal(setup.canAddSpecific, 0, "canAddSpecific var4");
  assert.equal(setup.addedEles[0], singleCreate, "addedEles var4");
  assert.equal(setup.addedIdxs[0], 0, "addedIdxs var4");
  assert.equal(setup.addedSpecific, 0, "addedSpecific var4");
});

/* jshint ignore:end */
