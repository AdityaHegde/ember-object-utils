(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['jquery', 'ember'], factory);
  } else {
    // Browser globals.
    root.Utils = factory(root.$);
  }
}(this, function($) {
/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("lib/almond.js", function(){});

define('hasMany',[
  "ember",
], function() {

/**
 * Creates a computed property for an array that when set with array of native js object will return an array of instances of a class.
 *
 * The class is decided by the 1st param 'modelClass'. If it is not a class but an object and 'modelClassKey', the 2nd parameter is a string,
 * then the 'modelClassKey' in the object is used as a key in 'modelClass' the object to get the class.
 * 'defaultKey' the 3rd parameter is used as a default if object[modelClassKey] is not present.
 *
 * Can pass a 4th argument. A registry of objects. If the object (identified by an idKey) is already present, reference to the object is returned.
 * 5th argument is the idKey
 *
 * @method hasMany
 * @for Utils
 * @static
 * @param {Class|Object} modelClass
 * @param {String} [modelClassKey]
 * @param {String} [defaultKey]
 * @param {Object} [registry]
 * @param {String} [idKey]
 * @returns {Instance}
 */
function hasMany(modelClass, modelClassKey, defaultKey, registry, idKey) {
  modelClass = modelClass || Ember.Object;
  var
  hasInheritance = Ember.typeOf(modelClass) !== "class",
  hasRegistry = registry && idKey;

  return Ember.computed(function(key, newval) {
    if(Ember.typeOf(modelClass) === 'string') {
      modelClass = Ember.get(modelClass);
      hasInheritance = Ember.typeOf(modelClass) !== "class";
    }
    if(Ember.typeOf(registry) === 'string') {
      registry = Ember.get(registry);
      hasRegistry = registry && idKey;
    }
    if(arguments.length > 1) {
      if(newval && newval.length) {
        newval.beginPropertyChanges();
        for(var i = 0; i < newval.length; i++) {
          var
          obj = newval[i], classObj = modelClass;
          if(hasRegistry && registry[obj[idKey]]) {
            obj = registry[obj[idKey]];
          }
          else {
            if(hasInheritance) classObj = modelClass[Ember.isEmpty(obj[modelClassKey]) ? defaultKey : obj[modelClassKey]];
            if(!(obj instanceof classObj)) {
              obj = classObj.create(obj);
              obj.set("parentObj", this);
            }
            if(hasRegistry) {
              registry[obj[idKey]] = obj;
            }
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
      hasMixin = mixin instanceof Ember.Mixin,
      hasMixinInheritance = !hasMixin && Ember.typeOf(mixin) === "object";
  return Ember.computed(function(key, newval) {
    if(Ember.typeOf(modelClass) === 'string') {
      modelClass = Ember.get(modelClass);
      hasInheritance = Ember.typeOf(modelClass) !== "class";
    }
    if(Ember.typeOf(mixin) === 'string') {
      mixin = Ember.get(mixin);
      hasMixin = mixin instanceof Ember.Mixin;
      hasMixinInheritance = !hasMixin && Ember.typeOf(mixin) === "object";
    }
    if(arguments.length > 1) {
      if(newval) {
        var classObj = modelClass;
        if(hasInheritance) classObj = modelClass[Ember.isEmpty(newval[modelClassKey]) ? defaultKey : newval[modelClassKey]];
        if(!(newval instanceof classObj)) {
          if(hasMixin) {
            newval = classObj.createWithMixins(mixin, newval);
          }
          else if(hasMixinInheritance) {
            newval = classObj.createWithMixins(mixin[newval[mixinKey] || defaultMixin], newval);
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
    Ember.set(this, "arrayProps", this.get("arrayProps") || []);
    this.addArrayObserverToProp("arrayProps");
    Ember.set(this, "arrayProps.propKey", "arrayProps");
    this.arrayPropsWasAdded(this.get("arrayProps") || []);
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
  var str = obj.toString(), match = str.match(extractIdRegex);
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
  hashHasKeys : hashHasKeys,
  getArrayFromRange : getArrayFromRange,
  getEmberId : getEmberId,
  getOffset : getOffset,
  emberDeepEqual : emberDeepEqual,
};

});

/**
 * @module ember-utils-core
 */
define('ember-utils-core',[
  "./hasMany",
  "./belongsTo",
  "./hierarchy",
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

  // Register in the values from the outer closure for common dependencies
  // as local almond modules
  define('jquery', function() {
    return $;
  });
  define('ember', function() {
    return Ember;
  });
 
  // Use almond's special top level synchronous require to trigger factory
  // functions, get the final module, and export it as the public api.
  return require('ember-utils-core');
}));
