/**
 * Created by Administrator on 2015/7/13.
 */
var config={
  watch:{
    test:{
      files:['temp/index.js','src/*.js'],
      tasks:['browserify:test']
    },
    bundle:{
        files:['src/*.js'],
        tasks:['browserify:bundle']
    }
  },
  browserify:{
    test:{
      src:'temp/index.js',
      dest:'temp/test.js'
    },
      bundle:{
      src:'index.js',
      dest:'temp/bundle.js'
    }
  }
};

module .exports=function(grunt){
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.initConfig(config);
};