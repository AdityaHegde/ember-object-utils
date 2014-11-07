define([
  "ember",
  "./objectWithArrayMixin",
], function(objectWithArrayMixin) {


/**
 * A mixin to add observers to array properties. Used in belongsTo of a ember-data model.
 * Adds after the HasMany object is resolved.
 *
 * @class Utils.DelayedAddToHasManyMixin
 * @extends Utils.ObjectWithArrayMixin
 * @static
 */
var delayAddId = 0;
var DelayedAddToHasManyMixin = Ember.Mixin.create(objectWithArrayMixin, {
  init : function() {
    this._super();
    this.set("arrayPropDelayedObjs", {});
  },

  arrayPropDelayedObjs : null,

  addDelayObserverToProp : function(propKey, method) {
    method = method || "propWasUpdated";
    Ember.addObserver(this, propKey, this, method);
  },

  removeDelayObserverFromProp : function(propKey) {
    method = method || "propWasUpdated";
    Ember.removeObserver(this, propKey, this, method);
  },

  propArrayNotifyChange : function(prop, key) {
    if(prop.then) {
      prop.set("canAddObjects", false);
      prop.then(function() {
        prop.set("canAddObjects", true);
      });
    }
    else {
      for(var i = 0; i < prop.get("length"); i++) {
        this[key+"WasAdded"](prop.objectAt(i), i, true);
      }
    }
  },

  /**
   * Method to add a property after the array prop loads.
   *
   * @property addToProp
   * @param {String} prop Property of array to add to.
   * @param {Instance} propObj Object to add to array.
   */
  addToProp : function(prop, propObj) {
    var arrayPropDelayedObjs = this.get("arrayPropDelayedObjs"), propArray = this.get(prop);
    if(propArray.get("canAddObjects")) {
      if(!propArray.contains(propObj)) {
        propArray.pushObject(propObj);
      }
    }
    else {
      arrayPropDelayedObjs[prop] = arrayPropDelayedObjs[prop] || [];
      if(!arrayPropDelayedObjs[prop].contains(propObj)) {
        arrayPropDelayedObjs[prop].push(propObj);
      }
    }
  },

  hasArrayProp : function(prop, findKey, findVal) {
    var arrayPropDelayedObjs = this.get("arrayPropDelayedObjs"), propArray = this.get(prop);
    if(propArray.get("canAddObjects")) {
      return !!propArray.findBy(findKey, findVal);
    }
    else if(arrayPropDelayedObjs && arrayPropDelayedObjs[prop]) {
      return !!arrayPropDelayedObjs[prop].findBy(findKey, findVal);
    }
    return false;
  },

  addToContent : function(prop) {
    var arrayPropDelayedObjs = this.get("arrayPropDelayedObjs"), propArray = this.get(prop);
    if(propArray.get("canAddObjects") && arrayPropDelayedObjs[prop]) {
      arrayPropDelayedObjs[prop].forEach(function(propObj) {
        if(!propArray.contains(propObj)) {
          propArray.pushObject(propObj);
        }
      }, propArray);
      delete arrayPropDelayedObjs[prop];
    }
  },

  arrayProps : null,
  arrayPropsWillBeDeleted : function(arrayProp) {
    this._super(arrayProp);
    this.removeDelayObserverFromProp(arrayProp+".canAddObjects");
  },
  arrayPropWasAdded : function(arrayProp) {
    this._super(arrayProp);
    var prop = this.get(arrayProp), that = this;
    if(!this["addTo_"+arrayProp]) this["addTo_"+arrayProp] = function(propObj) {
      that.addToProp(arrayProp, propObj);
    };
    this.addDelayObserverToProp(arrayProp+".canAddObjects", function(obj, key) {
      that.addToContent(arrayProp);
    });
  },

});


return {
  DelayedAddToHasManyMixin : DelayedAddToHasManyMixin,
};

});
