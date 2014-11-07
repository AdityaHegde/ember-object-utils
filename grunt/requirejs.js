module.exports = {
  compile : {
    options : {
      baseUrl : "src/js",
      dir : "build",
      mainConfigFile : "src/js/config.js",

      fileExclusionRegExp : /^(?:\.|_)/,
      findNestedDependencies : true,
      skipDirOptimize : true,
      removeCombined : true,
      optimize : "none",
      wrap : {
        startFile: "wrap/start.frag",
        endFile: "wrap/end.frag"
      },

      modules : [
        {
          name : "ember-utils-core",
          include : ["lib/almond.js"],
          exclude : [
            "jquery",
            "handlebars",
            "ember",
          ],
        },
      ],
    },
  },
};
