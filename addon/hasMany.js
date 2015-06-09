import Ember from 'ember';

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
 * @for EmberObjectUtils
 * @static
 * @param {Class|Object} modelClass
 * @param {String} [modelClassKey]
 * @param {String} [defaultKey]
 * @param {Object} [registry]
 * @param {String} [idKey]
 * @returns {Instance}
 */
export default function hasMany(modelClass, modelClassKey, defaultKey, registry, idKey) {
  modelClass = modelClass || Ember.Object;
  var
  hasInheritance = Ember.typeOf(modelClass) !== "class",
  hasRegistry = registry && idKey;

  return Ember.computed({
    set : function(key, newval) {
      if(Ember.typeOf(modelClass) === 'string') {
        modelClass = Ember.get(modelClass);
        hasInheritance = Ember.typeOf(modelClass) !== "class";
      }
      if(Ember.typeOf(registry) === 'string') {
        registry = Ember.get(registry);
        hasRegistry = registry && idKey;
      }
      if(newval && newval.length) {
        newval = Ember.A(newval);
        for(var i = 0; i < newval.length; i++) {
          var
          obj = newval[i], classObj = modelClass;
          if(hasRegistry && registry[obj[idKey]]) {
            obj = registry[obj[idKey]];
          }
          else {
            if(hasInheritance) {
              classObj = modelClass[Ember.isEmpty(obj[modelClassKey]) ? defaultKey : obj[modelClassKey]];
            }
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
      }
      this["_" + key] = newval;
      return newval;
    },
    get : function(key) {
      return this["_" + key];
    },
  });
}
