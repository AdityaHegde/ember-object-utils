/**
 * @module ember-utils-core
 */

import Ember                from "ember";
import hasMany              from "./hasMany";
import belongsTo            from "./belongsTo";
import hierarchy            from "./hierarchy/index";
import objectWithArrayMixin from "./objectWithArrayMixin";

var
EmberUtilsCore = Ember.Namespace.create(),
modules = [hierarchy];

for(var i = 0; i < modules.length; i++) {
  for(var k in modules[i]) {
    if(modules[i].hasOwnProperty(k)) {
      EmberUtilsCore[k] = modules[i][k];
    }
  }
}

EmberUtilsCore.hasMany = hasMany;
EmberUtilsCore.belongsTo = belongsTo;
EmberUtilsCore.ObjectWithArrayMixin = objectWithArrayMixin;

export default EmberUtilsCore;
