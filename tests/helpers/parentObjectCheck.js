import Ember from "ember";

function _parentObjectCheck(obj) {
  for(var k in obj) {
    if(k === "parentObj") {
      obj[k] = null;
    }
    else if(Ember.typeOf(obj[k]) === "instance") {
      _parentObjectCheck(obj);
    }
  }
}

export default Ember.Test.registerHelper("parentObjectCheck", function (app, obj) {
  _parentObjectCheck();
});
