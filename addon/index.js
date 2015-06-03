/**
 * @module ember-utils-core
 */

import Ember                from "ember";
import hasMany              from "./hasMany";
import belongsTo            from "./belongsTo";
import hierarchy            from "./hierarchy/index";
import objectWithArrayMixin from "./objectWithArrayMixin";
import misc                 from "./misc";
import merge                from "./merge";

var
EmberUtilsCore = Ember.Namespace.create(),
modules = [hierarchy, misc];

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
EmberUtilsCore.merge = merge;

export default EmberUtilsCore;
