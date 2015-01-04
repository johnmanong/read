'use strcit';
module.exports = function(grunt) {
  // tasks here
  grunt.initConfig({
    connect: {
      server: {
        options: {
          livereload: true,
          base: 'client_app/'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },

      scripts: {
        files: ['client_app/scripts/**/*.js', '*.html']
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['connect:server', 'watch'])
};



