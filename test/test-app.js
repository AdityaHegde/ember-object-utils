define([
  "ember",
  "ember_qunit",
], function(Ember, emq) {

  var TestApp;
  Ember.run(function() {
    TestApp = Ember.Application.create({
      rootElement : "#ember-testing",
    });
    window.TestApp = TestApp;

    emq.globalize();
    TestApp.setupForTesting();
    TestApp.injectTestHelpers();
    setResolver(Ember.DefaultResolver.create({ namespace: TestApp }));
  });

  return TestApp;

});
