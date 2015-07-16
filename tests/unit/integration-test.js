import Ember from "ember";
import EmberObjectUtils from "ember-object-utils";
import startApp from "../helpers/start-app";
import { module, test } from "qunit";

module("Integration Test", {
  beforeEach : function(assert) {
    assert.application = startApp();
  },
  afterEach : function(assert) {
    Ember.run(assert.application, 'destroy');
  },
});

test("hasMany with ObjectWithArrayMixin", function(assert) {
  var
  addedData = [],
  removedData = [],
  vara1Obj = Ember.Object.extend({
    varaa : "",
    varab : "1",
    varac : "id1",
  }),
  vara2Obj = Ember.Object.extend({
    varaa : "",
    varab : "2",
    varac : "id2",
  }),
  vara3Obj = Ember.Object.extend({
    varaa : "",
    varab : "3",
    varac : "id3",
  }),
  map = {
    "1" : vara1Obj,
    "2" : vara2Obj,
    "3" : vara3Obj,
  },
  object = Ember.Object.extend(EmberObjectUtils.ObjectWithArrayMixin, {
    arrayProps : ["vara"],
    vara : EmberObjectUtils.hasMany(map, "varab"),
    varaWasAdded : function(varas/*, idxs*/) {
      addedData = Ember.A(varas).mapBy("varaa");
    },
    varaWillBeDeleted : function(varas/*, idxs*/) {
      removedData = Ember.A(varas).mapBy("varaa");
    },
  }),
  inst;

  Ember.run(function() {
    inst = object.create({
      vara : [{
        varaa : "vara1",
        varab : "1",
      }, {
        varaa : "vara2",
        varab : "2",
      }, {
        varaa : "vara3",
        varab : "3",
      }],
    });
  });

  andThen(function() {
    assert.deepEqual(inst.get("vara").mapBy("varac"), ["id1", "id2", "id3"]);
    assert.deepEqual(addedData, ["vara1", "vara2", "vara3"]);
    assert.deepEqual(removedData, []);

    Ember.run(function() {
      inst.setProperties({
        vara : [{
          varaa : "vara4",
          varab : "2",
        }, {
          varaa : "vara5",
          varab : "3",
        }, {
          varaa : "vara6",
          varab : "2",
        }],
      });
    });
  });

  andThen(function() {
    assert.deepEqual(inst.get("vara").mapBy("varac"), ["id2", "id3", "id2"]);
    assert.deepEqual(addedData, ["vara4", "vara5", "vara6"]);
    assert.deepEqual(removedData, ["vara1", "vara2", "vara3"]);
  });
});
