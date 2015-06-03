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
 * @for EmberUtilsCore
 * @static
 * @param {Object} hierarchy
 */
export default function registerHierarchy(hierarchy) {
  hierarchy.hierarchyMeta = getMetaFromHierarchy(hierarchy);
}
