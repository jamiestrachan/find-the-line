module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      debug: {
        files: [
          {expand: true, cwd: 'src/assets/', src: ['**'], dest: 'assets/'}
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
    concat: {
      js: {
        files: {
          'js/findtheline.js': [
            'src/js/findtheline.settings.js',
            'src/js/findtheline.helpers.js',
            'src/js/findtheline.point.js',
            'src/js/findtheline.player.js',
            'src/js/findtheline.enemy.js',
            'src/js/findtheline.display.js',
            'src/js/findtheline.scorekeeper.js',
            'src/js/findtheline.controller.js'
          ]
        }
      }
    },
    uglify: {
      deploy: {
        files: {
          'js/findtheline.js': [
            'src/js/findtheline.settings.js',
            'src/js/findtheline.helpers.js',
            'src/js/findtheline.point.js',
            'src/js/findtheline.player.js',
            'src/js/findtheline.enemy.js',
            'src/js/findtheline.display.js',
            'src/js/findtheline.scorekeeper.js',
            'src/js/findtheline.controller.js'
          ]
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          hostname: 'localhost',
          base: '.'
        }
      }
    },
    open: {
      local: {
        path: 'http://localhost:9000'
      }
    },
    watch: {
      files: ['index.html', 'src/js/*.js', 'src/scss/*.scss'],
      tasks: ['default']
    },
    clean: {
      main: ['assets', 'css', 'js']
    }
  });

  // Load plugins
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'clean', 'copy:debug', 'sass:debug', 'concat:js']);
  grunt.registerTask('develop', ['default', 'connect:server', 'open:local', 'watch']);
  grunt.registerTask('deploy', ['jshint', 'clean', 'copy:deploy', 'sass:deploy', 'uglify:deploy']);

};