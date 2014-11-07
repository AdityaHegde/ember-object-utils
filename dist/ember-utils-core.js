(function () {define('hasMany',[
  "ember",
], function() {

/**
 * Creates a computed property for an array that when set with array of native js object will return an array of instances of a class.
 *
 * The class is decided by the 1st param 'modelClass'. If it is not a class but an object and 'modelClassKey', the 2nd parameter is a string,
 * then the 'modelClassKey' in the object is used as a key in 'modelClass' the object to get the class.
 * 'defaultKey' the 3rd parameter is used as a default if object[modelClassKey] is not present.
 *
 * @method hasMany
 * @for Utils
 * @static
 * @param {Class|Object} modelClass
 * @param {String} [modelClassKey]
 * @param {String} [defaultKey]
 * @returns {Instance}
 */
function hasMany(modelClass, modelClassKey, defaultKey) {
  modelClass = modelClass || Ember.Object;
  var hasInheritance = Ember.typeOf(modelClass) !== "class";

  return Ember.computed(function(key, newval) {
    if(Ember.typeOf(modelClass) === 'string') {
      modelClass = Ember.get(modelClass);
      hasInheritance = Ember.typeOf(modelClass) !== "class";
    }
    if(arguments.length > 1) {
      if(newval && newval.length) {
        newval.beginPropertyChanges();
        for(var i = 0; i < newval.length; i++) {
          var obj = newval[i], classObj = modelClass;
          if(hasInheritance) classObj = modelClass[Ember.isEmpty(obj[modelClassKey]) ? defaultKey : obj[modelClassKey]];
          if(!(obj instanceof classObj)) {
            obj = classObj.create(obj);
            obj.set("parentObj", this);
          }
          newval.splice(i, 1, obj);
        }
        newval.endPropertyChanges();
      }
      return newval;
    }
  });
};

return {
  hasMany : hasMany,
};


});

define('belongsTo',[
  "ember",
], function() {

/**
 * Creates a computed property for an object that when set with native js object will return an instances of a class.
 *
 * The class is decided by the 1st param 'modelClass'. If it is not a class but an object and 'modelClassKey', the 2nd parameter is a string,
 * then the 'modelClassKey' in the object is used as a key in 'modelClass' the object to get the class.
 * 'defaultKey' the 3rd parameter is used as a default if object[modelClassKey] is not present.
 *
 * Optionally can create the instance with mixin. A single mixin can be passed or a map of mixins as 4th parameter with key extracted from object using mixinKey (5th parameter) can be passed.
 * 'defaultMixin' (6th parameter) is used when object[mixinKey] is not present.
 *
 * @method belongsTo
 * @for Utils
 * @static
 * @param {Class|Object} modelClass
 * @param {String} [modelClassKey]
 * @param {String} [defaultKey]
 * @param {Mixin|Object} [mixin]
 * @param {String} [mixinKey]
 * @param {String} [defaultMixin]
 * @returns {Instance}
 */
function belongsTo(modelClass, modelClassKey, defaultKey, mixin, mixinKey, defaultMixin) {
  modelClass = modelClass || Ember.Object;
  var hasInheritance = Ember.typeOf(modelClass) !== "class",
      hasMixin = mixin instanceof Ember.Mixin;
  return Ember.computed(function(key, newval) {
    if(Ember.typeOf(modelClass) === 'string') {
      modelClass = Ember.get(modelClass);
      hasInheritance = Ember.typeOf(modelClass) !== "class";
    }
    if(Ember.typeOf(mixin) === 'string') {
      mixin = Ember.get(mixin);
      hasMixin = mixin instanceof Ember.Mixin;
    }
    if(arguments.length > 1) {
      if(newval) {
        var classObj = modelClass;
        if(hasInheritance) classObj = modelClass[Ember.isEmpty(newval[modelClassKey]) ? defaultKey : newval[modelClassKey]];
        if(!(newval instanceof classObj)) {
          if(hasMixin) {
            newval = classObj.createWithMixins(newval, mixinMap[newval[mixinKey] || defaultMixin]);
          }
          else {
            newval = classObj.create(newval);
          }
          newval.set("parentObj", this);
        }
      }
      return newval;
    }
  });
};

return {
  belongsTo : belongsTo,
}


});

define('hierarchy',[
  "ember",
], function() {


function getMetaFromHierarchy(hasManyHierarchy) {
  var meta = {};
  for(var i = 0; i < hasManyHierarchy.length; i++) {
    for(var c in hasManyHierarchy[i].classes) {
      if(hasManyHierarchy[i].classes.hasOwnProperty(c)) {
        meta[c] = {
          level : i,
        };
      }
    }
  }
  hasManyHierarchy.hierarchyMeta = meta;
  return meta;
}

/**
 * Register a hierarchy. This will setup the meta of the hierarchy.
 *
 * @method registerHierarchy
 * @for Utils
 * @static
 * @param {Object} hierarchy
 */
function registerHierarchy(hierarchy) {
  hierarchy.hierarchyMeta = getMetaFromHierarchy(hierarchy);
};

/**
 * Add an entry to the hierarchy. It takes care of updating meta also.
 *
 * @method addToHierarchy
 * @static
 * @param {Object} hierarchy
 * @param {String} type
 * @param {Class} classObj
 * @param {Number} level
 */
function addToHierarchy(hierarchy, type, classObj, level) {
  var meta = hierarchy.hierarchyMeta;
  hierarchy[level].classes[type] = classObj;
  meta[type] = {
    level : level,
  };
};

function getObjForHierarchyLevel(obj, meta, hierarchy, level) {
  var param = {};
  param[hierarchy[level].childrenKey] = Ember.typeOf(obj) === "array" ? obj : [obj];
  return hierarchy[level].classes[hierarchy[level].base].create(param);
}

function getObjTillLevel(obj, meta, hierarchy, fromLevel, toLevel) {
  for(var i = fromLevel - 1; i >= toLevel; i--) {
    obj = getObjForHierarchyLevel(obj, meta, hierarchy, i);
  }
  return obj;
}

/**
 * Creates a computed property which creates a class for every element in the set array based on hierarchy.
 * The objects in the array can be of any level at or below the current level. An instance with the basic class is automatically wrapped around the objects at lower level.
 *
 * @method hasManyWithHierarchy
 * @static
 * @param {Object} hasManyHierarchy Assumed to be already initialized by calling 'registerHierarchy'.
 * @param {Number} level Level of the computed property.
 * @param {String} key Key used to get the key used in retrieving the class object in the classes map.
 * @returns {Instance}
 */
function hasManyWithHierarchy(hasManyHierarchy, level, hkey) {
  var meta;
  if(Ember.typeOf(hasManyHierarchy) === "array") {
    meta = hasManyHierarchy.hierarchyMeta;
  }
  return Ember.computed(function(key, newval) {
    if(arguments.length > 1) {
      if(Ember.typeOf(hasManyHierarchy) === "string") {
        hasManyHierarchy = Ember.get(hasManyHierarchy);
        meta = hasManyHierarchy.hierarchyMeta;
      }
      if(newval) {
        //curLevel, curLevelArray
        var cl = -1, cla = [];
        for(var i = 0; i < newval.length; i++) {
          var obj = newval[i], _obj = {},
              type = Ember.typeOf(obj) === "array" ? obj[0] : obj[hkey],
              objMeta = meta[type];
          if(Ember.typeOf(obj) !== "instance") {
            if(objMeta && objMeta.level >= level) {
              if(Ember.typeOf(obj) === "array") {
                for(var j = 0; j < hasManyHierarchy[objMeta.level].keysInArray.length; j++) {
                  if(j < obj.length) {
                    _obj[hasManyHierarchy[objMeta.level].keysInArray[j]] = obj[j];
                  }
                }
              }
              else {
                _obj = obj;
              }
              _obj = hasManyHierarchy[objMeta.level].classes[type].create(_obj);
              if(cl === -1 || cl === objMeta.level) {
                cla.push(_obj);
                cl = objMeta.level;
              }
              else if(cl < objMeta.level) {
                cla.push(getObjTillLevel(_obj, meta, hasManyHierarchy, objMeta.level, cl));
              }
              else {
                var curObj = getObjForHierarchyLevel(cla, meta, hasManyHierarchy, objMeta.level);
                cl = objMeta.level;
                cla = [curObj, _obj];
              }
            }
          }
          else {
            cla.push(obj);
          }
        }
        if(cl === level || cl === -1) {
          newval = cla;
        }
        else {
          newval = [getObjTillLevel(cla, meta, hasManyHierarchy, cl, level)];
        }
      }
      return newval;
    }
  });
};


return {
  registerHierarchy : registerHierarchy,
  addToHierarchy : addToHierarchy,
  hasManyWithHierarchy : hasManyWithHierarchy,
};

});

define('objectWithArrayMixin',[
  "ember",
], function() {


/**
 * A mixin to add observers to array properties.
 *
 * @class Utils.ObjectWithArrayMixin
 * @static
 */
var ObjectWithArrayMixin = Ember.Mixin.create({
  init : function() {
    this._super();
    this.set("arrayProps", this.get("arrayProps") || []);
    this.addArrayObserverToProp("arrayProps");
    this.set("arrayProps.propKey", "arrayProps");
    this.arrayPropsWasAdded(this.get("arrayProps"));
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
      var idxs = Utils.getArrayFromRange(0, prop.get("length"));
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
      var idxs = Utils.getArrayFromRange(0, prop.get("length"));
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
      var propKey = array.get("propKey"), idxs = Utils.getArrayFromRange(idx, idx + removedCount);
      this[propKey+"WillBeDeleted"](array.objectsAt(idxs), idxs);
    }
  },
  propArrayDidChange : function(array, idx, removedCount, addedCount) {
    if((array.content || array.length) && array.get("length") > 0) {
      var propKey = array.get("propKey"),
          addedIdxs = [], removedObjs = [],
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
    return true;
  },
  arrayPropsWasAdded : function(arrayProps) {
    for(var i = 0; i < arrayProps.length; i++) {
      this.arrayPropWasAdded(arrayProps[i]);
    }
  },
  arrayPropWasAdded : function(arrayProp) {
    var prop = this.get(arrayProp);
    if(!this[arrayProp+"WillBeDeleted"]) this[arrayProp+"WillBeDeleted"] = this.propWillBeDeleted;
    if(!this[arrayProp+"CanAdd"]) this[arrayProp+"CanAdd"] = this.propCanAdd;
    if(!this[arrayProp+"WasAdded"]) this[arrayProp+"WasAdded"] = this.propWasAdded;
    if(!prop) {
      this.set(arrayProp, []);
    }
    else {
      this.propArrayNotifyChange(prop, arrayProp);
    }
    this.addArrayObserverToProp(arrayProp);
    this.addBeforeObserverToProp(arrayProp);
    this.addObserverToProp(arrayProp);
  },

});


return {
  ObjectWithArrayMixin : ObjectWithArrayMixin,
};

});

define('delayedAddToHasManyMixin',[
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

define('misc',[
  "ember",
], function() {

/**
 * Search in a multi level array.
 *
 * @method deepSearchArray
 * @for Utils
 * @static
 * @param {Object} d Root object to search from.
 * @param {any} e Element to search for.
 * @param {String} k Key of the element in the object.
 * @param {String} ak Key of the array to dig deep.
 * @returns {Object} Returns the found object.
 */
function deepSearchArray(d, e, k, ak) { //d - data, e - element, k - key, ak - array key
  if(e === undefined || e === null) return null;
  if(d[k] === e) return d;
  if(d[ak]) {
    for(var i = 0; i < d[ak].length; i++) {
      var ret = Utils.deepSearchArray(d[ak][i], e, k, ak);
      if(ret) {
        return ret;
      }
    }
  }
  return null;
};

/**
 * Binary insertion within a sorted array.
 *
 * @method binaryInsert
 * @static
 * @param {Array} a Sorted array to insert in.
 * @param {any} e Element to insert.
 * @param {Function} [c] Optional comparator to use.
 */
var cmp = function(a, b) {
  return a - b;
};
var binarySearch = function(a, e, l, h, c) {
  var i = Math.floor((h + l) / 2), o = a.objectAt(i);
  if(l > h) return l;
  if(c(e, o) >= 0) {
    return binarySearch(a, e, i + 1, h, c);
  }
  else {
    return binarySearch(a, e, l, i - 1, c);
  }
};
function binaryInsert(a, e, c) {
  c = c || cmp;
  var len = a.get("length");
  if(len > 0) {
    var i = binarySearch(a, e, 0, len - 1, c);
    a.insertAt(i, e);
  }
  else {
    a.pushObject(e);
  }
};

/**
 * Merge a src object to a tar object and return tar.
 *
 * @method merge
 * @static
 * @param {Object} tar Target object.
 * @param {Object} src Source object.
 * @param {Boolean} [replace=false] Replace keys if they already existed.
 * @returns {Object} Returns the target object.
 */
function merge(tar, src, replace) {
  for(var k in src) {
    if(!src.hasOwnProperty(k) || !Ember.isNone(tar[k])) {
      continue;
    }
    if(Ember.isEmpty(tar[k]) || replace) {
      tar[k] = src[k];
    }
  }
  return tar;
};

/**
 * Checks if an object has any key.
 *
 * @method hashHasKeys
 * @static
 * @param {Object} hash Object to check for keys.
 * @returns {Boolean}
 */
function hashHasKeys(hash) {
  for(var k in hash) {
    if(hash.hasOwnProperty(k)) return true;
  }
  return false;
};

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
};

var extractIdRegex = /:(ember\d+):?/;
/**
 * Get the ember assigned id to the instance.
 *
 * @method getEmberId
 * @static
 * @param {Instance} obj
 * @returns {String} Ember assigned id.
 */
function getEmberId(obj) {
  var str = obj.toString(), match = str.match(Utils.ExtractIdRegex);
  return match && match[1];
};

/**
 * Recursively return the offset of an element relative to a parent element.
 *
 * @method getOffset
 * @static
 * @param {DOMElement} ele
 * @param {String} type Type of the offset.
 * @param {String} parentSelector Selector for the parent.
 * @param {Number} Offset.
 */
function getOffset(ele, type, parentSelector) {
  parentSelector = parentSelector || "body";
  if(!Ember.isEmpty($(ele).filter(parentSelector))) {
    return 0;
  }
  return ele["offset"+type] + Utils.getOffset(ele.offsetParent, type, parentSelector);
};

function emberDeepEqual(src, tar) {
  for(var k in tar) {
    var kObj = src.get(k);
    if(Ember.typeOf(tar[k]) === "object" || Ember.typeOf(tar[k]) === "instance") {
      return Utils.emberDeepEqual(kObj, tar[k]);
    }
    else if(Ember.typeOf(tar[k]) === "array") {
      for(var i = 0; i < tar[k].length; i++) {
        if(!Utils.emberDeepEqual(kObj.objectAt(i), tar[k][i])) {
          return false;
        }
      }
    }
    else if(tar[k] !== kObj) {
      console.log(kObj + " not equal to " + tar[k] + " for key : " + k);
      return false;
    }
  }
  return true;
};

return {
  deepSearchArray : deepSearchArray,
  binaryInsert : binaryInsert,
  merge : merge,
  getArrayFromRange : getArrayFromRange,
  getEmberId : getEmberId,
  getOffset : getOffset,
  emberDeepEqual : emberDeepEqual,
};

});

/**
 * @module ember-utils-core
 */
define('main',[
  "./hasMany",
  "./belongsTo",
  "./hierarchy",
  "./delayedAddToHasManyMixin",
  "./objectWithArrayMixin",
  //"./hashMapArray",
  "./misc",
], function() {
  /**
   * Global class
   *
   * @class Utils
   */
  var Utils = Ember.Namespace.create();
  window.Utils = Utils;

  //start after DS
  for(var i = 0; i < arguments.length; i++) {
    for(var k in arguments[i]) {
      if(arguments[i].hasOwnProperty(k)) {
        Utils[k] = arguments[i][k];
      }
    }
  }

  return Utils;
});


require(["main"]);
}());