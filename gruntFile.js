/**
 * Created by Administrator on 2015/7/13.
 */
var config={
  watch:{
    test:{
      files:['temp/index.js','src/*.js'],
      tasks:['browserify:test']
    }
  },
  browserify:{
    test:{
      src:'temp/index.js',
      dest:'temp/test.js'
    }
  }
};

module .exports=function(grunt){
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.initConfig(config);
};