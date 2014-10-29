module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      debug: {
        files: [
          {expand: true, cwd: 'src/assets/', src: ['**'], dest: 'assets/'},
          {expand: true, cwd: 'src/js/', src: ['**'], dest: 'js/'}
        ]
      },
      deploy: {
        files: [
          {expand: true, cwd: 'src/assets/', src: ['**'], dest: 'assets/'}
        ]
      }
    },
    sass: {
      debug: {
        options: {
          style: 'expanded'
        },
        files: {
          'css/findtheline.css': 'src/scss/findtheline.scss'
        }
      },
      deploy: {
        options: {
          style: 'compressed'
        },
        files: {
          'css/findtheline.css': 'src/scss/findtheline.scss'
        }
      }
    },
    jshint: {
      all: ['src/js/*.js']
    },
    uglify: {
      deploy: {
        files: {
          'js/findtheline.js': ['src/js/findtheline.js']
        }
      }
    },
    clean: {
      main: ['assets', 'css', 'js']
    }
  });

  // Load plugins
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Default task(s).
  grunt.registerTask('debug', ['jshint', 'copy:debug', 'sass:debug']);
  grunt.registerTask('default', ['jshint', 'copy:deploy', 'sass:deploy', 'uglify:deploy']);

};