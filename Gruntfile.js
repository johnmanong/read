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
      },

      css: {
        files: ['client_app/stylesheets/**/*.scss'],
        tasks: ['sass:dev']
      }
    },
    sass: {
      dev: {
        options: {
          sourcemap: true
        },
        files: [
        {
          expand: true,
          cwd: 'client_app/stylesheets',
          src: ['**/*.scss'],
          dest: 'client_app/stylesheets/build',
          ext: '.css',
        }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');


  grunt.registerTask('default', [
    'sass:dev',
    'connect:server',
    'watch'
    ])
};



