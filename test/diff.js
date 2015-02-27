define([
  "source/ember-utils-core",
], function(Utils) {

return function() {

module("Utils.diff");


test("Basic tests", function() {
  var assertions = [
    {
      src : "123",
      tar : "456",
      res : "456",
    },
    {
      src : {a : 1, b : 2},
      tar : {a : 1, b : 2},
      res : undefined,
    },
    {
      src : {a : 1, b : 2},
      tar : {a : 1, b : 3, c : 4},
      res : {b : 3, c : 4},
    },
    {
      src : {a : {b : 1, c : 2}},
      tar : {a : {c : 3, d : 4}},
      res : {a : {c : 3, d : 4}},
    },
    {
      src : {a : [{b : 1}, {b : 2}]},
      tar : {a : [{b : 1}, {b : 3}]},
      res : {a : [undefined, {b : 3}]},
    },
  ];

  for(var i = 0; i < assertions.length; i++) {
    var res = Utils.diff(assertions[i].src, assertions[i].tar);
    deepEqual(res, assertions[i].res);
  }
});


};

});
