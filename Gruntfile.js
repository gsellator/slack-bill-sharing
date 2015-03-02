module.exports = function(grunt) {
  require('time-grunt')(grunt);

  grunt.initConfig({
    // Dev tasks
    concurrent: {
      dev: ["nodemon", "watch"],
      options: {
        logConcurrentOutput: true
      }
    },

    sass: {
      dev: {
        options: {
          sourcemap: true,
          update: true
        },
        files: [{
          expand: true,
          cwd: 'public/scss/',
          src: ['*.scss'],
          dest: 'public/css',
          ext: '.css'
        }]
      },
      prod: {
        options: {
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: 'public/scss/',
          src: ['*.scss'],
          dest: 'pkg/public/css',
          ext: '.css'
        }]
      }
    },

    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          env: {
            "NODE_ENV": 'dev'
          },
          watch: ['app.js', 'config', 'controllers', 'helpers', 'models'],
          delay: 300,

          callback: function (nodemon) {
            // Log nodemon actions
            nodemon.on('log', function (event) {console.log(event.colour);});

            // Open the application in a new browser window and is optional
            //            nodemon.on('config:update', function () {setTimeout(function() {require('open')('http://localhost:3090', 'Google Chrome Canary');}, 1000);});

            // Update .rebooted to fire Live-Reload
            nodemon.on('restart', function () {setTimeout(function() {
              require('fs').writeFileSync('.rebooted', 'rebooted');
            }, 1000);});
          }
        }
      }
    },

    watch: {
      scss: {
        files: ['public/scss/**/*.scss'],
        tasks: ['sass:dev']
      },
      livereload: {
        files: ['public/js/**/*.js', 'public/css/*.css'],
        options: {
          livereload: 35740
        }
      }
    },

    // Build tasks
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      css: ["public/css/*"],
      pkg: ["pkg/"],
    },

    bump: {
      options: {
        commit: false,
        createTag: false,
        push: false
      }
    },

    copy: {
      main: {
        files: [
          {src: [
            '.bowerrc',
            'app.js',
            'bower.json',
            'config/**',
            'controllers/**',
            'helpers/**',
            'models/**',
            'package.json',
            'public/**',
            'sh/**',
            'views/**'
          ], dest: 'pkg/'}
        ]
      }
    },

    imagemin: {
      full: {
        files: [{
          expand: true,
          cwd: 'public/',
          src: ['img/**/*.{png,jpg,gif}'],
          dest: 'pkg/public/'
        }]
      }
    },

    'sftp-deploy': {
      prod: {
        auth: {
          host: 'delirium.cloudapp.net',
          port: 22,
          authKey: 'prod'
        },
        src: 'pkg',
        dest: '/home/slack-bill-sharing-prod/slack-bill-sharing',
        server_sep: '/'
      }
    }
  });

  // Dev tasks
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ["clean:css", "sass:dev", 'concurrent']);

  // Build tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-sftp-deploy');

  grunt.registerTask('prod', ['clean:pkg', 'sass:prod', 'copy:main', 'imagemin:full', 'sftp-deploy', 'bump']);
};
