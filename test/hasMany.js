define([
  "source/ember-utils-core",
], function(Utils) {

return function() {

module("Utils.Utils.hasMany");

test("Simple Utils.hasMany", function() {
  var 
  classChild = Ember.Object.extend({
    vara : "child1",
  }),
  classObj = Ember.Object.extend({
    arr1 : Utils.hasMany(),
    arr2 : Utils.hasMany(classChild),
    arr3 : Utils.hasMany("Ember.ClassChild"),
  });
  Ember.ClassChild = Ember.Object.extend({
    vara : "child2",
  });
  var classes = [Ember.Object, classChild, Ember.ClassChild];

  var obj = classObj.create({
    arr1 : [{varb : "a11"}, {varb : "a12"}, {varb : "a13"}],
    arr2 : [{varb : "a21"}, {varb : "a22"}, {varb : "a23"}],
    arr3 : [{varb : "a31"}, {varb : "a32"}, {varb : "a33"}],
  });

  var rightInstance = true, rightValues = true;
  for(var i = 0; i < 3; i++) {
    var arr = obj.get("arr"+(i+1));
    for(var j = 0; j < 3; j++) {
      if(!(arr[j] instanceof classes[i])) {
        rightInstance = false;
      }
      if(arr[j].get("varb") !== "a"+(i+1)+(j+1)) {
        rightValues = false;
      }
      if(i > 0 && arr[j].get("vara") !== "child"+i) {
        rightValues = false;
      }
    }
  }
  ok(rightInstance);
  ok(rightValues);
});

test("Utils.hasMany with map", function() {
  var 
  classChild1 = Ember.Object.extend({
    vara : "child1",
  }),
  classChild2 = Ember.Object.extend({
    vara : "child2",
  }),
  classChild3 = Ember.Object.extend({
    vara : "child3",
  }),
  map = {
    "c1" : classChild1,
    "c2" : classChild2,
    "c3" : classChild3,
  },
  classObj = Ember.Object.extend({
    arr1 : Utils.hasMany(map, "varb", "c1"),
    arr2 : Utils.hasMany("Ember.HasManyMap", "varb", "c1"),
  });
  var classes = [classChild1, classChild2, classChild3];
  Ember.HasManyMap = {
    "c1" : classChild3,
    "c2" : classChild2,
    "c3" : classChild1,
  };

  var obj = classObj.create({
    arr1 : [{varb : "c1"}, {varb : "c2"}, {varb : "c3"}, {}],
    arr2 : [{varb : "c1"}, {varb : "c2"}, {varb : "c3"}, {}],
  });

  var rightInstance = true, rightValues = true;
  for(var i = 0; i < 2; i++) {
    var arr = obj.get("arr"+(i+1));
    for(var j = 0; j < 4; j++) {
      var _j = Math.abs(i === 0 ? j%3 : (2-j%3));
      if(!(arr[j] instanceof classes[_j])) {
        rightInstance = false;
      }
      if(arr[j].get("vara") !== "child"+(_j+1)) {
        rightValues = false;
      }
    }
  }
  ok(rightInstance);
  ok(rightValues);
});

};

});
