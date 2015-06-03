import Ember from "ember";
import EmberUtilsCore from "ember-utils-core";
import { module, test } from "qunit";

module("Misc methods in EmberUtilsCore");

test("EmberUtilsCore.deepSearchArray", function(assert) {
  var assertions = [
    {
      data : {a : 1, b : 1, c : Ember.A([
        {a : 2, b : 2},
        {a : 3, b : 3},
        {a : 4, b : 4, c : Ember.A([
          {a : 5, b : 5},
          {a : 6, b : 6},
        ])},
      ])},
      key : "a",
      arrayKey : "c",
      element : 5,
      result : true,
    },
    {
      data : {a : 1, b : 1, c : Ember.A([
        {a : 2, b : 2},
        {a : 3, b : 3},
        {a : 4, b : 4, c : Ember.A([
          {a : 5, b : 5},
          {a : 6, b : 6},
        ])},
      ])},
      key : "a",
      arrayKey : "c",
      element : 7,
      result : false,
    },
  ];

  for(var i = 0; i < assertions.length; i++) {
    assert.equal(!!EmberUtilsCore.deepSearchArray(assertions[i].data, assertions[i].element, assertions[i].key, assertions[i].arrayKey), assertions[i].result);
  }
});


test("EmberUtilsCore.binaryInsert", function(assert) {
  var assertions = [
    {
      data : Ember.A([]),
      element : 3,
      result : Ember.A([3]),
    },
    {
      data : Ember.A([3]),
      element : 1,
      result : Ember.A([1, 3]),
    },
    {
      data : Ember.A([3]),
      element : 4,
      result : Ember.A([3, 4]),
    },
    {
      data : Ember.A([1, 3]),
      element : 2,
      result : Ember.A([1, 2, 3]),
    },
    {
      data : Ember.A([1, 3]),
      element : 0,
      result : Ember.A([0, 1, 3]),
    },
    {
      data : Ember.A([1, 3]),
      element : 5,
      result : Ember.A([1, 3, 5]),
    },
  ];

  for(var i = 0; i < assertions.length; i++) {
    EmberUtilsCore.binaryInsert(assertions[i].data, assertions[i].element);
    assert.deepEqual(assertions[i].data, assertions[i].result);
  }
});
