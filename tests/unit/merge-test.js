import Ember from "ember";
import EmberUtilsCore from "ember-utils-core";
import { module, test } from "qunit";

module("EmberUtilsCore.merge");

test("Basic tests", function(assert) {
  var assertions = [
    {
      src : {a : 1, b : 2},
      tar : {a : 1, b : 3, c : 4},
      res : {a : 1, b : 3, c : 4},
      replace : null,
    },
    {
      src : {a : 1, b : 2},
      tar : {a : 1, b : 3, c : 4},
      res : {a : 1, b : 2, c : 4},
      replace : 1,
    },
    {
      src : {a : {b : 1, c : 2}},
      tar : {a : {c : 3, d : 4}},
      res : {a : {b : 1, c : 2, d : 4}},
      replace : 1,
    },
    {
      src : {a : [{b : 1}, {b : 2}]},
      tar : {a : [{b : 2}, {b : 3}]},
      res : {a : [{b : 1}, {b : 2}]},
      replace : 1,
    },
    {
      src : {a : [null, {b : 2}, {b : 3}, {b : 4}]},
      tar : {a : [{b : 2}, {b : 3}, {b : 0}, {}]},
      res : {a : [{b : 2}, {b : 2}, {b : 3}, {b : 4}]},
      replace : 1,
    },
  ];

  for(var i = 0; i < assertions.length; i++) {
    EmberUtilsCore.merge(assertions[i].tar, assertions[i].src, assertions[i].replace);
    assert.deepEqual(assertions[i].tar, assertions[i].res);
  }
});
