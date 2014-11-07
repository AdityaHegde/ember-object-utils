module.exports = {
  compile: {
    options: {
      templateBasePath: /src\/templates\//,
      templateName: function(name) {
        return name.replace(/__/g, "/");
      },
      preprocess: function(source) {
        return source.replace(/\s+/g, ' ');
      },
    },
    files: {
      "build/templates.js": "src/templates/*.hbs",
    }
  },
  compile_dev: {
    options: {
      precompile : false,
      templateBasePath: /src\/templates\//,
      templateName: function(name) {
        return name.replace(/__/g, "/");
      },
      templateRegistration : function(name, contents) {
        contents = contents.replace(/'/g, '"');
        contents = contents.replace(/\\"/g, '"');
        contents = contents.replace(/\\n(\s*)/g, " ' +\n$1  '");
        contents = contents.replace(/compile\("/, "compile('' +\n  '");
        contents = contents.replace(/  '"\)$/, "'')");
        return "Ember.TEMPLATES[\""+name+"\"] = "+contents+";";
      },
    },
    files: {
      "src/js/demo/templates.js": "src/templates/*.hbs",
    }
  }
};
