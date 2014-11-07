var require = {
  baseUrl : "/src/js",
  paths : {
    jquery         : "lib/jquery-2.1.1",
    handlebars     : "lib/handlebars",
    ember          : "lib/ember",
  },
  shim : {
    ember : {
      deps : [ "jquery", "handlebars" ],
      exports : "Ember",
    },
  },
};
