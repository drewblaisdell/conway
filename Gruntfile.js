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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['copy']);
};