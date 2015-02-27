define([
  "ember",
], function() {

var
typeOf = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
},
_diff = function(srcObj, tarObj, meta) {
  var
  diffObj,
  hasDiff = 0,
  fullKey = meta.hierarchy.join("."),
  fullKeyActual = meta.hierarchyActual.join(".");
  if(typeOf(srcObj) === "object") {
    //console.log("Object : " + fullKeyActual);
    if(typeOf(tarObj) === "object") {
      diffObj = {};
      for(var k in tarObj) {
        meta.hierarchy.push(k);
        meta.hierarchyActual.push(k);
        var d = _diff(srcObj[k], tarObj[k], meta);
        meta.hierarchyActual.pop();
        meta.hierarchy.pop();
        if(d !== undefined) {
          diffObj[k] = d;
          hasDiff = 1;
        }
      }
    }
  }
  else if(typeOf(srcObj) === "array") {
    //console.log("Array : " + fullKeyActual);
    if(typeOf(tarObj) === "array") {
      diffObj = [];
      for(var i = 0; i < tarObj.length; i++) {
        meta.hierarchy.push("@");
        meta.hierarchyActual.push(i);
        var d = _diff(srcObj[i], tarObj[i], meta);
        meta.hierarchyActual.pop();
        meta.hierarchy.pop();
        diffObj.push(d);
        if(d !== undefined) {
          hasDiff = 1;
        }
      }
    }
  }
  else {
    //console.log("Scalar : " + fullKeyActual);
    if(!meta.ignoreKeys[fullKey]) {
      if(srcObj !== tarObj) {
        diffObj = tarObj;
        hasDiff = 1;
      }
    }
  }
  return hasDiff === 1 ? diffObj : undefined;
},
/**
 * Return the diff of 2 objects.
 *
 * @method diff
 * @for Utils
 * @static
 * @param {Object} srcObj
 * @param {Object} tarObj
 * @param {Object} [ignoreKeys] A map of keys to ignore.
 * @returns {Object}
 */
diff = function(srcObj, tarObj, ignoreKeys) {
  return _diff(srcObj, tarObj, {
    ignoreKeys      : ignoreKeys || {},
    hierarchy       : [],
    hierarchyActual : [],
  });
};

return {
  diff : diff,
};


});
