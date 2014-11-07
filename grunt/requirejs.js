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
      wrap: true,
      /*{
        //startFile: ["wrap/start.frag", "wrap/almond.js"],
        startFile: "wrap/start.frag",
        endFile: "wrap/end.frag"
      },*/

      modules : [
        {
          name : "main",
          exclude : [
            "jquery",
            "handlebars",
            "ember",
          ],
          insertRequire : ["main"],
        },
      ],
    },
  },
};
