import Ember from 'ember';

function typeOf(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

/**
 * Merge a src object to a tar object and return tar.
 *
 * @method merge
 * @for EmberUtilsCore
 * @static
 * @param {Object} tar Target object.
 * @param {Object} src Source object.
 * @param {Boolean} [replace=false] Replace keys if they already existed.
 * @returns {Object} Returns the target object.
 */
export default function merge(tar, src, replace) {
  if(Ember.isNone(tar)) {
    return src;
  }
  else if(Ember.isNone(src)) {
    return tar;
  }
  if(typeOf(src) === "object") {
    for(var k in src) {
      if(src.hasOwnProperty(k)) {
        if(Ember.isNone(tar[k]) || replace) {
          tar[k] = merge(tar[k], src[k], replace);
        }
      }
    }
  }
  else if(typeOf(src) === "array") {
    if(src.length === tar.length) {
      for(var i = 0; i < src.length; i++) {
        tar[i] = merge(tar[i], src[i], replace);
      }
    }
    else {
      return src;
    }
  }
  else {
    return src;
  }
  return tar;
}
