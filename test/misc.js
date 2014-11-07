define([
  "source/ember-utils-core",
], function(Utils) {

return function() {


module("Misc methods in Utils");

test("Utils.deepSearchArray", function() {
  var assertions = [
    {
      data : {a : 1, b : 1, c : [
        {a : 2, b : 2},
        {a : 3, b : 3},
        {a : 4, b : 4, c : [
          {a : 5, b : 5},
          {a : 6, b : 6},
        ]},
      ]},
      key : "a",
      arrayKey : "c",
      element : 5,
      result : true,
    },
    {
      data : {a : 1, b : 1, c : [
        {a : 2, b : 2},
        {a : 3, b : 3},
        {a : 4, b : 4, c : [
          {a : 5, b : 5},
          {a : 6, b : 6},
        ]},
      ]},
      key : "a",
      arrayKey : "c",
      element : 7,
      result : false,
    },
  ];

  for(var i = 0; i < assertions.length; i++) {
    equal(!!Utils.deepSearchArray(assertions[i].data, assertions[i].element, assertions[i].key, assertions[i].arrayKey), assertions[i].result);
  }
});


test("Utils.binaryInsert", function() {
  var assertions = [
    {
      data : [],
      element : 3,
      result : [3],
    },
    {
      data : [3],
      element : 1,
      result : [1, 3],
    },
    {
      data : [3],
      element : 4,
      result : [3, 4],
    },
    {
      data : [1, 3],
      element : 2,
      result : [1, 2, 3],
    },
    {
      data : [1, 3],
      element : 0,
      result : [0, 1, 3],
    },
    {
      data : [1, 3],
      element : 5,
      result : [1, 3, 5],
    },
  ];

  for(var i = 0; i < assertions.length; i++) {
    Utils.binaryInsert(assertions[i].data, assertions[i].element);
    deepEqual(assertions[i].data, assertions[i].result);
  }
});


};

});
