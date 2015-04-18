module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'string-replace': {
      build: {
        files: {
          'dist/': 'dist/*.js',
        },
        options: {
          replacements: [{
            pattern: /@VERSION@/g,
            replacement: '<%= pkg.version %>'
          }]
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      beforereplace: ['src/eventhooks.js'],
      other: ['Gruntfile.js']
    },
    concat: {
      dist: {
        src: ['tmp/meta.js', 'src/eventhooks.js'],
        dest: 'dist/InstaSynchP-Event-Hooks.user.js'
      }
    },
    'userscript-meta': {
      build: {
        dest: 'tmp/meta.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-userscript-meta');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['userscript-meta', 'concat',
    'string-replace'
  ]);
  grunt.registerTask('default', ['build', 'test']);
};
