module.exports = {
  dist: {
    options : {
      mangle : {
        except: ["jQuery", "Ember", "Em", "DS"],
      },
    },
    files: {
      "dist/ember-utils-core.min.js": "dist/ember-utils-core.js",
    }
  }
};

