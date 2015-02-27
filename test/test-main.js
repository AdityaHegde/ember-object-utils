define([
  "jquery",
  "handlebars",
  "ember",
  "ember_qunit",
  "./test-app",
  "./hasMany",
  "./hasManyWithHeirarchy",
  "./belongsTo",
  "./objectWithArrayMixin",
  "./misc",
  "./merge",
  "./diff",
], function() {
  for(var i = 5; i < arguments.length; i++) {
    arguments[i]();
  }
  QUnit.load();
  QUnit.start();
});
