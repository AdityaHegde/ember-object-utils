import Ember from 'ember';

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
 * Can pass a 7th argument. A registry of objects. If the object (identified by an idKey) is already present, reference to the object is returned.
 * 8th argument is the idKey
 *
 * @method belongsTo
 * @for EmberObjectUtils
 * @static
 * @param {Class|Object} modelClass
 * @param {String} [modelClassKey]
 * @param {String} [defaultKey]
 * @param {Mixin|Object} [mixin]
 * @param {String} [mixinKey]
 * @param {String} [defaultMixin]
 * @param {Object} [registry]
 * @param {String} [idKey]
 * @returns {Instance}
 */
export default function belongsTo(modelClass, modelClassKey, defaultKey, mixin, mixinKey, defaultMixin, registry, idKey) {
  modelClass = modelClass || Ember.Object;
  var
  hasInheritance = Ember.typeOf(modelClass) !== "class",
  hasMixin = mixin instanceof Ember.Mixin,
  hasMixinInheritance = !hasMixin && Ember.typeOf(mixin) === "object",
  hasRegistry = registry && idKey;
  return Ember.computed({
    set : function(key, newval) {
      if(Ember.typeOf(modelClass) === 'string') {
        modelClass = Ember.get(modelClass);
        hasInheritance = Ember.typeOf(modelClass) !== "class";
      }
      if(Ember.typeOf(mixin) === 'string') {
        mixin = Ember.get(mixin);
        hasMixin = mixin instanceof Ember.Mixin;
        hasMixinInheritance = !hasMixin && Ember.typeOf(mixin) === "object";
      }
      if(Ember.typeOf(registry) === 'string') {
        registry = Ember.get(registry);
        hasRegistry = registry && idKey;
      }
      if(newval) {
        var classObj = modelClass;
        if(hasRegistry && registry[newval[idKey]]) {
          newval = registry[newval[idKey]];
        }
        else {
          if(hasInheritance) {
            classObj = modelClass[Ember.isEmpty(newval[modelClassKey]) ? defaultKey : newval[modelClassKey]];
          }
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
      }
      this["_" + key] = newval;
      return newval;
    },

    get : function(key) {
      return this["_" + key];
    },
  });
}
