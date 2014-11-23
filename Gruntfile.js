module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    less: {
      production: {
        options: {
          paths: ["public/css"],
          cleancss: true
        },
        files: {
          "public/css/style.css": "less/style.less"
        }
      }
    },
    watch :{
      less: {
        files: [
          'less/*.less',
          'less/*/*.less'
        ],
        tasks: ['less']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['less']);
};