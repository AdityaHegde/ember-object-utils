define([
  "source/main",
], function(Utils) {

return function() {

module("Utils.objectWithArrayMixin");

function setupObjectWithArrayMixin() {
  var 
  setup = {
    deletedEles : null, deletedIdxs : null, deletedSpecific : null,
    canAddEle : null, canAddIdx : null, canAddSpecific : null,
    addedEles : null, addedIdxs : null, addedSpecific : null,
  },
  classObj = Ember.Object.extend(Utils.ObjectWithArrayMixin, {
    arrayProps : ["var0", "var1", "var2", "var3"],
    var0 : null,
    var1 : null,
    var2 : null,
    var3 : null,

    var0WillBeDeleted : function(eles, idxs) {
      setup.deletedEles = eles;
      setup.deletedIdxs = idxs;
      setup.deletedSpecific = 1;
    },
    var0CanAdd : function(ele, idx) {
      setup.canAddEle = ele;
      setup.canAddIdx = idx;
      setup.canAddSpecific = 1;
      return !ele.get("vara");
    },
    var0WasAdded : function(eles, idxs) {
      setup.addedEles = eles;
      setup.addedIdxs = idxs;
      setup.addedSpecific = 1;
    },
    var1WillBeDeleted : function(eles, idxs) {
      setup.deletedEles = eles;
      setup.deletedIdxs = idxs;
      setup.deletedSpecific = 1;
    },
    var1CanAdd : function(ele, idx) {
      setup.canAddEle = ele;
      setup.canAddIdx = idx;
      setup.canAddSpecific = 1;
      return !ele.get("vara");
    },
    var1WasAdded : function(eles, idxs) {
      setup.addedEles = eles;
      setup.addedIdxs = idxs;
      setup.addedSpecific = 1;
    },
    propWillBeDeleted : function(eles, idxs) {
      setup.deletedEles = eles;
      setup.deletedIdxs = idxs;
      setup.deletedSpecific = 0;
    },
    propCanAdd : function(ele, idx) {
      setup.canAddEle = ele;
      setup.canAddIdx = idx;
      setup.canAddSpecific = 0;
      return !ele.get("vara");
    },
    propWasAdded : function(eles, idxs) {
      setup.addedEles = eles;
      setup.addedIdxs = idxs;
      setup.addedSpecific = 0;
    },
  }),
  class0Obj = Ember.Object.extend({
    varc : "c0",
  }),
  class1Obj = Ember.Object.extend({
    varc : "c1",
  }),
  class2Obj = Ember.Object.extend({
    varc : "c2",
  }),
  class3Obj = Ember.Object.extend({
    varc : "c3",
  });
  setup.classes = [class0Obj, class1Obj, class2Obj, class3Obj];
  setup.obj = classObj.create();
  return setup;
}

test("objectWithArrayMixin, single add to an empty array", function() {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    singleCreate = setup.classes[i].create();

    Ember.run(function() {
      setup.obj.get(vari).pushObject(singleCreate);
    });

    andThen(function() {
      equal(setup.canAddEle, singleCreate, "canAddEle for "+i);
      equal(setup.canAddIdx, 0, "canAddIdx for "+i);
      equal(setup.canAddSpecific, i < 2 ? 1 : 0, "canAddSpecific for "+i);
      equal(setup.addedEles[0], singleCreate, "addedEles for "+i);
      equal(setup.addedIdxs[0], 0, "addedIdxs for "+i);
      equal(setup.addedSpecific, i < 2 ? 1 : 0, "addedSpecific for "+i);
      equal(setup.obj.get(varil), 1, "var"+i+" length");
    });
  }
});

test("objectWithArrayMixin, single add to a non empty array", function() {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    singleCreate = setup.classes[i].create();

    Ember.run(function() {
      for(var j = 0; j < 3; j++) {
        setup.obj.get(vari).pushObject(setup.classes[i].create());
      }
      setup.obj.get(vari).insertAt(1, singleCreate);
    });

    andThen(function() {
      equal(setup.canAddEle, singleCreate, "canAddEle for "+i);
      equal(setup.canAddIdx, 1, "canAddIdx for "+i);
      equal(setup.canAddSpecific, i < 2 ? 1 : 0, "canAddSpecific for "+i);
      equal(setup.addedEles[0], singleCreate, "addedEles for "+i);
      equal(setup.addedIdxs[0], 1, "addedIdxs for "+i);
      equal(setup.addedSpecific, i < 2 ? 1 : 0, "addedSpecific for "+i);
      equal(setup.obj.get(varil), 4, "var"+i+" length");
    });
  }
});

test("objectWithArrayMixin, multiple add to an array", function() {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    (function() {
      var
      vari = "var"+i, varil = "var"+i+".length", j = i,
      objs = [setup.classes[i].create(), setup.classes[i].create({vara : 1}), setup.classes[i].create()];

      andThen(function() {
        Ember.run(function() {
          setup.obj.get(vari).pushObjects(objs);
        });
      });

      andThen(function() {
        objs.removeAt(1);
        deepEqual(setup.addedEles, objs, "addedEles for "+j);
        deepEqual(setup.addedIdxs, [0, 2], "addedIdxs for "+j);
        equal(setup.addedSpecific, j < 2 ? 1 : 0, "addedSpecific for "+j);
        equal(setup.obj.get(varil), 2, "var"+j+" length");
      });
    })();
  }
});

test("objectWithArrayMixin, delete from an array", function() {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    deleted;

    Ember.run(function() {
      for(var j = 0; j < 3; j++) {
        setup.obj.get(vari).pushObject(setup.classes[i].create());
      }
      deleted = setup.obj.get(vari).objectAt(1);
      setup.obj.get(vari).removeAt(1);
    });

    andThen(function() {
      equal(setup.deletedEles[0], deleted, "deletedEles for "+i);
      equal(setup.deletedIdxs[0], 1, "deletedIdxs for "+i);
      equal(setup.deletedSpecific, i < 2 ? 1 : 0, "deletedSpecific for "+i);
      equal(setup.obj.get(varil), 2, "var"+i+" length");
    });
  }
});

test("objectWithArrayMixin, changing array", function() {
  var setup = setupObjectWithArrayMixin();

  for(var i = 0; i < 4; i++) {
    var
    vari = "var"+i, varil = "var"+i+".length",
    oldArr, newArr;

    Ember.run(function() {
      for(var j = 0; j < 3; j++) {
        setup.obj.get(vari).pushObject(setup.classes[i].create());
      }
      oldArr = setup.obj.get(vari);
      newArr = [setup.classes[i].create(), setup.classes[i].create(), setup.classes[i].create()];
      setup.obj.set(vari, newArr);
    });

    andThen(function() {
      deepEqual(setup.deletedEles, oldArr, "deletedEles for array change");
      deepEqual(setup.deletedIdxs, [0, 1, 2], "deletedIdxs for array change");
      equal(setup.deletedSpecific, i < 2 ? 1 : 0, "deletedSpecific for array change");
      deepEqual(setup.addedEles, newArr, "addedEles for array change");
      deepEqual(setup.addedIdxs, [0, 1, 2], "addedIdxs for array change");
      equal(setup.addedSpecific, i < 2 ? 1 : 0, "addedSpecific for array change");
      equal(setup.obj.get(varil), 3, "var"+i+" length");
    });
  }
});

test("objectWithArrayMixin, dynamic arrayProps", function() {
  var setup = setupObjectWithArrayMixin(), singleCreate;

  setup.canAddEle = setup.canAddIdx = setup.canAddSpecific = null;
  setup.addedEles = setup.addedIdxs = setup.addedSpecific = null;

  Ember.run(function() {
    setup.obj.get("arrayProps").removeAt(0);
  });

  andThen(function() {
    Ember.run(function() {
      setup.obj.get("var0").pushObject(setup.classes[0].create());
    });
  });

  andThen(function() {
    equal(setup.canAddEle, null);
    equal(setup.canAddIdx, null);
    equal(setup.canAddSpecific, null);
    equal(setup.addedEles, null);
    equal(setup.addedIdxs, null);
    equal(setup.addedSpecific, null);
  });

  Ember.run(function() {
    setup.obj.get("arrayProps").pushObject("var4");
  });

  andThen(function() {
    Ember.run(function() {
      singleCreate = setup.classes[0].create();
      setup.obj.get("var4").pushObject(singleCreate);
    });
  });

  andThen(function() {
    equal(setup.canAddEle, singleCreate, "canAddEle var4");
    equal(setup.canAddIdx, 0, "canAddIdx var4");
    equal(setup.canAddSpecific, 0, "canAddSpecific var4");
    equal(setup.addedEles[0], singleCreate, "addedEles var4");
    equal(setup.addedIdxs[0], 0, "addedIdxs var4");
    equal(setup.addedSpecific, 0, "addedSpecific var4");
  });
});

};

});
