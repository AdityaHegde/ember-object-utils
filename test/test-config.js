var require = {
  paths : {
    source         : "../src/js",
    jquery         : "../src/js/lib/jquery-2.1.1",
    handlebars     : "../src/js/lib/handlebars",
    ember          : "../src/js/lib/ember",
    ember_qunit    : "../src/js/lib/ember-qunit",
  },
  shim : {
    ember : {
      deps : [ "jquery", "handlebars"],
      exports : "Ember",
    },
    ember_qunit : {
      deps : [ "ember" ],
      exports : "emq",
    },
  },
};
