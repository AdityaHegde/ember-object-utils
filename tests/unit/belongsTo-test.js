import Ember from "ember";
import EmberObjectUtils from "ember-object-utils";
import { module, test } from "qunit";

module("EmberObjectUtils.belongsTo");

test("Simple EmberObjectUtils.belongsTo", function(assert) {
  var 
  classChild = Ember.Object.extend({
    vara : "child1",
  }),
  classObj = Ember.Object.extend({
    obj0 : EmberObjectUtils.belongsTo(),
    obj1 : EmberObjectUtils.belongsTo(classChild),
    obj2 : EmberObjectUtils.belongsTo("constructor.ClassChild"),
    obj3 : EmberObjectUtils.belongsTo(),
  });
  classObj.ClassChild = Ember.Object.extend({
    vara : "child2",
  });
  var classes = [Ember.Object, classChild, classObj.ClassChild, Ember.Object];

  var obj = classObj.create({
    obj0 : {varb : "b1", vara : "child0"},
    obj1 : {varb : "b2"},
    obj2 : {varb : "b3"},
    obj3 : null,
  });

  var rightInstance = true, rightValues = true;
  for(var i = 0; i < 4; i++) {
    var obji = obj.get("obj"+i);
    if(obji) {
      if(!(obji instanceof classes[i])) {
        rightInstance = false;
      }
      if(obji.get("varb") !== "b"+(i+1) || obji.get("vara") !== "child"+i) {
        rightValues = false;
      }
    }
  }
  assert.ok(rightInstance);
  assert.ok(rightValues);
});

test("EmberObjectUtils.belongsTo with map", function(assert) {
  var 
  classChild1 = Ember.Object.extend({
    vara : "child1",
  }),
  classChild2 = Ember.Object.extend({
    vara : "child2",
  }),
  classChild3 = Ember.Object.extend({
    vara : "child3",
  }),
  map = {
    "c1" : classChild1,
    "c2" : classChild2,
    "c3" : classChild3,
  },
  classObj = Ember.Object.extend({
    obj00 : EmberObjectUtils.belongsTo(map, "varb", "c1"),
    obj01 : EmberObjectUtils.belongsTo(map, "varb", "c1"),
    obj02 : EmberObjectUtils.belongsTo(map, "varb", "c1"),
    obj03 : EmberObjectUtils.belongsTo(map, "varb", "c1"),
    obj10 : EmberObjectUtils.belongsTo("constructor.BelongsToMap", "varb", "c1"),
    obj11 : EmberObjectUtils.belongsTo("constructor.BelongsToMap", "varb", "c1"),
    obj12 : EmberObjectUtils.belongsTo("constructor.BelongsToMap", "varb", "c1"),
    obj13 : EmberObjectUtils.belongsTo("constructor.BelongsToMap", "varb", "c1"),
  });
  var classes = [classChild1, classChild2, classChild3];
  classObj.BelongsToMap = {
    "c1" : classChild3,
    "c2" : classChild2,
    "c3" : classChild1,
  };

  var obj = classObj.create({
    obj00 : {varb : "c1"},
    obj01 : {varb : "c2"},
    obj02 : {varb : "c3"},
    obj03 : {},
    obj10 : {varb : "c1"},
    obj11 : {varb : "c2"},
    obj12 : {varb : "c3"},
    obj13 : {},
  });

  var rightInstance = true, rightValues = true;
  for(var i = 0; i < 2; i++) {
    for(var j = 0; j < 4; j++) {
      var objij = obj.get("obj"+i+""+j);
      var _j = Math.abs(i === 0 ? j%3 : (2-j%3));
      if(!(objij instanceof classes[_j])) {
        rightInstance = false;
      }
      if(objij.get("vara") !== "child"+(_j+1)) {
        rightValues = false;
      }
    }
  }
  assert.ok(rightInstance);
  assert.ok(rightValues);
});
