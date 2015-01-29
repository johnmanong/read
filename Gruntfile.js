'use strcit';


SASS_FILES = [{
  expand: true,
  cwd: 'client_app/stylesheets',
  src: ['**/*.scss'],
  dest: 'client_app/stylesheets/build',
  ext: '.css',
}]

JS_FILES = {
  'client_app/scripts/build/index.js': ['client_app/scripts/**/*.jsx']
}

module.exports = function(grunt) {
  // tasks here
  grunt.initConfig({
    connect: {
      server: {
        options: {
          livereload: true,
          base: 'client_app/'
        }
      },
      dist: {
        options: {
          livereload: false,
          base: 'dist/',
          keepalive: true
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
        files: SASS_FILES
      },
      prod: {
        options: {
          sourcemap: false
        },
        files: SASS_FILES
      }
    },

    browserify: {
      dev: {
        options: {
          debug: true,
          transform: ['reactify']
        },
        files: JS_FILES
      },
      prod: {
        options: {
          debug: false,
          transform: ['reactify']
        },
        files: JS_FILES
      }
    },

    copy: {
      dist: {
        files: [
          {expand: true, cwd: 'client_app', src: ['mock_data/*'], dest: 'dist/', filter: 'isFile'},
          {expand: true, cwd: 'client_app', src: ['scripts/build/*'], dest: 'dist/', filter: 'isFile'},
          {expand: true, cwd: 'client_app', src: ['stylesheets/build/*'], dest: 'dist/', filter: 'isFile'},
          {expand: true, cwd: 'client_app', src: ['index.html'], dest: 'dist/', filter: 'isFile'},
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-takana');

  grunt.registerTask('_build:dev', [
    'sass:dev',
    'browserify:dev'
  ]);

  grunt.registerTask('_build:dist', [
    'sass:prod',
    'browserify:prod'
  ]);

  grunt.registerTask('default', [
    '_build:dev',
    'connect:server',
    'watch'
  ]);

  grunt.registerTask('tk', [
    'connect:server',
    'watch'
  ])

  grunt.registerTask('dist', [
    '_build:dist',
    'copy:dist',
    'connect:dist'
  ]);

};



