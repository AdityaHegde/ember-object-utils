/**
 * @module ember-object-utils
 */

import Ember                from "ember";
import hasMany              from "./hasMany";
import belongsTo            from "./belongsTo";
import hierarchy            from "./hierarchy/index";
import objectWithArrayMixin from "./objectWithArrayMixin";

var
EmberObjectUtils = Ember.Namespace.create(),
modules = [hierarchy];

for(var i = 0; i < modules.length; i++) {
  for(var k in modules[i]) {
    if(modules[i].hasOwnProperty(k)) {
      EmberObjectUtils[k] = modules[i][k];
    }
  }
}

EmberObjectUtils.hasMany = hasMany;
EmberObjectUtils.belongsTo = belongsTo;
EmberObjectUtils.ObjectWithArrayMixin = objectWithArrayMixin;

export default EmberObjectUtils;
