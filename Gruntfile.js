'use strcit';


SASS_FILES = {}

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
    },

    browserify: {
      dev: {
        options: {
          debug: true,
          transform: ['reactify']
        },
        files: {
          'client_app/scripts/build/index.js': ['client_app/scripts/**/*.jsx']
        }
      }

    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-takana');

  grunt.registerTask('_build_dev', [
    'sass:dev',
    'browserify:dev'
  ]);

  grunt.registerTask('default', [
    '_build_dev',
    'connect:server',
    'watch'
  ]);

  grunt.registerTask('tk', [
    'connect:server',
    'watch'
  ])

};



