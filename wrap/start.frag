(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['jquery'], factory);
  } else {
    // Browser globals.
    root.Utils = factory(root.$);
  }
}(this, function($) {
