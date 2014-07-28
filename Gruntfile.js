module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      client: {
        src: 'core/*',
        dest: 'public/js/'
      },
      server: {
        src: 'core/*',
        dest: 'app/'
      }
    },

    processhtml: {
      development: {
        files: {
          'public/index.html': ['public/template.html']
        }
      },
      production: {
        files: {
          'public/index.html': ['public/template.html']
        }
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'public/js',
          name: 'main',
          out: 'public/js/main-built.js',
          paths: {
              'socket.io': 'https://cdn.socket.io/socket.io-1.0.4'
          }
        }
      }
    },

    cssmin: {
      combine: {
        files: {
          'public/css/all.css': ['public/css/main.css', 'public/css/transitions.css']
        }
      },

      minify: {
        expand: true,
        cwd: 'public/css/',
        src: ['all.css'],
        dest: 'public/css/',
        ext: '.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['copy', 'processhtml:development']);
  grunt.registerTask('development', ['copy', 'processhtml:development']);
  grunt.registerTask('production', ['copy', 'requirejs', 'processhtml:production', 'cssmin']);
};