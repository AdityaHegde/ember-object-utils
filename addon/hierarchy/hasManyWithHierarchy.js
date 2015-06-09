import Ember from 'ember';

function getObjForHierarchyLevel(obj, meta, hierarchy, level) {
  var param = {};
  param[hierarchy[level].childrenKey] = Ember.typeOf(obj) === "array" ? obj : Ember.A([obj]);
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
export default function hasManyWithHierarchy(hasManyHierarchy, level, hkey) {
  var meta;
  if(Ember.typeOf(hasManyHierarchy) === "array") {
    meta = hasManyHierarchy.hierarchyMeta;
  }
  return Ember.computed({
    set : function(key, newval) {
      if(Ember.typeOf(hasManyHierarchy) === "string") {
        hasManyHierarchy = Ember.get(hasManyHierarchy);
        meta = hasManyHierarchy.hierarchyMeta;
      }
      if(newval) {
        var curLevel = -1, curLevelArray = Ember.A([]);
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
              if(curLevel === -1 || curLevel === objMeta.level) {
                curLevelArray.push(_obj);
                curLevel = objMeta.level;
              }
              else if(curLevel < objMeta.level) {
                curLevelArray.push(getObjTillLevel(_obj, meta, hasManyHierarchy, objMeta.level, curLevel));
              }
              else {
                var curObj = getObjForHierarchyLevel(curLevelArray, meta, hasManyHierarchy, objMeta.level);
                curLevel = objMeta.level;
                curLevelArray = Ember.A([curObj, _obj]);
              }
            }
          }
          else {
            curLevelArray.push(obj);
          }
        }
        if(curLevel === level || curLevel === -1) {
          newval = curLevelArray;
        }
        else {
          newval = Ember.A([getObjTillLevel(curLevelArray, meta, hasManyHierarchy, curLevel, level)]);
        }
      }
      this["_" + key] = newval;
      return newval;
    },
  });
}
