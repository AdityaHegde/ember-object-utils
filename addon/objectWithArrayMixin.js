import Ember from 'ember';

/**
 * Returns an array of integers from a starting number to another number with steps.
 *
 * @method getArrayFromRange
 * @static
 * @param {Number} l Starting number.
 * @param {Number} h Ending number.
 * @param {Number} s Steps.
 * @returns {Array}
 */
function getArrayFromRange(l, h, s) {
  var a = [];
  s = s || 1;
  for(var i = l; i < h; i += s) {
    a.push(i);
  }
  return a;
}

/**
 * A mixin to add observers to array properties.
 *
 * @class EmberObjectUtils.ObjectWithArrayMixin
 * @static
 */
export default Ember.Mixin.create({
  init : function() {
    this._super();
    Ember.set(this, "arrayProps", Ember.A(this.get("arrayProps") || []));
    this.addArrayObserverToProp("arrayProps");
    Ember.set(this, "arrayProps.propKey", "arrayProps");
    this.arrayPropsWasAdded(this.get("arrayProps") || Ember.A([]));
  },

  addBeforeObserverToProp : function(propKey) {
    Ember.addBeforeObserver(this, propKey, this, "propWillChange");
  },

  removeBeforeObserverFromProp : function(propKey) {
    Ember.removeBeforeObserver(this, propKey, this, "propWillChange");
  },

  addObserverToProp : function(propKey) {
    Ember.addObserver(this, propKey, this, "propDidChange");
  },

  removeObserverFromProp : function(propKey) {
    Ember.removeObserver(this, propKey, this, "propDidChange");
  },

  propWillChange : function(obj, key) {
    this.removeArrayObserverFromProp(key);
    var prop = this.get(key);
    if(prop && prop.objectsAt) {
      var idxs = getArrayFromRange(0, prop.get("length"));
      this[key+"WillBeDeleted"](prop.objectsAt(idxs), idxs, true);
    }
  },

  propDidChange : function(obj, key) {
    this.addArrayObserverToProp(key);
    var prop = this.get(key);
    if(prop) {
      this.propArrayNotifyChange(prop, key);
    }
  },

  propArrayNotifyChange : function(prop, key) {
    if(prop.objectsAt) {
      var idxs = getArrayFromRange(0, prop.get("length"));
      this[key+"WasAdded"](prop.objectsAt(idxs), idxs, true);
    }
  },

  addArrayObserverToProp : function(propKey) {
    var prop = this.get(propKey);
    if(prop && prop.addArrayObserver) {
      prop.set("propKey", propKey);
      prop.addArrayObserver(this, {
        willChange : this.propArrayWillChange,
        didChange : this.propArrayDidChange,
      });
    }
  },

  removeArrayObserverFromProp : function(propKey) {
    var prop = this.get(propKey);
    if(prop && prop.removeArrayObserver) {
      prop.removeArrayObserver(this, {
        willChange : this.propArrayWillChange,
        didChange : this.propArrayDidChange,
      });
    }
  },

  propArrayWillChange : function(array, idx, removedCount, addedCount) {
    if((array.content || array.length) && array.get("length") > 0) {
      var propKey = array.get("propKey"), idxs = getArrayFromRange(idx, idx + removedCount);
      this[propKey+"WillBeDeleted"](array.objectsAt(idxs), idxs);
    }
    //for jshint
    addedCount = 0;
  },
  propArrayDidChange : function(array, idx, removedCount, addedCount) {
    if((array.content || array.length) && array.get("length") > 0) {
      var propKey = array.get("propKey"),
          addedIdxs = Ember.A([]), removedObjs = Ember.A([]),
          rc = 0;
      for(var i = idx; i < idx + addedCount; i++) {
        var obj = array.objectAt(i);
        if(!this[propKey+"CanAdd"](obj, i)) {
          removedObjs.push(obj);
          rc++;
        }
        else {
          addedIdxs.push(i);
        }
      }
      if(addedIdxs.length > 0) {
        this[propKey+"WasAdded"](array.objectsAt(addedIdxs), addedIdxs);
      }
      if(removedObjs.length > 0) {
        array.removeObjects(removedObjs);
      }
    }
  },

  /**
   * Method called just before array elements will be deleted. This is a fallback method. A method with name <propKey>WillBeDeleted can be added to handle for 'propKey' seperately.
   *
   * @method propWillBeDeleted
   * @param {Array} eles The elements that will be deleted.
   * @param {Array} idxs The indices of the elements that will be deleted.
   */
  propWillBeDeleted : function(eles, idxs) {
    //for jshint
    eles = idxs = [];
  },
  /**
   * Method called when deciding whether to add an ele or not. This is a fallback method. A method with name <propKey>CanAdd can be added to handle for 'propKey' seperately.
   *
   * @method propCanAdd
   * @param {Object|Instance} ele The element that can be added or not.
   * @param {Number} idx The indice of the element that can be added or not.
   * @returns {Boolean}
   */
  propCanAdd : function(ele, idx) {
    //for jshint
    ele = idx = [];
    return true;
  },
  /**
   * Method called after array elements are added. This is a fallback method. A method with name <propKey>WasAdded can be added to handle for 'propKey' seperately.
   *
   * @method propWasAdded
   * @param {Array} eles The elements that are added.
   * @param {Array} idxs The indices of the elements that are added.
   */
  propWasAdded : function(eles, idxs) {
    //for jshint
    eles = idxs = [];
  },

  /**
   * List of keys to array properties.
   *
   * @property arrayProps
   * @type Array
   */
  arrayProps : null,
  arrayPropsWillBeDeleted : function(arrayProps) {
    for(var i = 0; i < arrayProps.length; i++) {
      this.removeArrayObserverFromProp(arrayProps[i]);
      this.removeBeforeObserverFromProp(arrayProps[i]);
      this.removeObserverFromProp(arrayProps[i]);
    }
  },
  arrayPropsCanAdd : function(ele, idx) {
    //for jshint
    ele = idx = [];
    return true;
  },
  arrayPropsWasAdded : function(arrayProps) {
    for(var i = 0; i < arrayProps.length; i++) {
      this.arrayPropWasAdded(arrayProps[i]);
    }
  },
  arrayPropWasAdded : function(arrayProp) {
    var prop = this.get(arrayProp);
    if(!this[arrayProp+"WillBeDeleted"]) {
      this[arrayProp+"WillBeDeleted"] = this.propWillBeDeleted;
    }
    if(!this[arrayProp+"CanAdd"]) {
      this[arrayProp+"CanAdd"] = this.propCanAdd;
    }
    if(!this[arrayProp+"WasAdded"]) {
      this[arrayProp+"WasAdded"] = this.propWasAdded;
    }
    if(!prop) {
      this.set(arrayProp, Ember.A([]));
    }
    else {
      this.propArrayNotifyChange(prop, arrayProp);
    }
    this.addArrayObserverToProp(arrayProp);
    this.addBeforeObserverToProp(arrayProp);
    this.addObserverToProp(arrayProp);
  },

});
