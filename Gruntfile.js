module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    var entityJSON = grunt.file.read("media/textures/entities.txt");
    var screensJSON = grunt.file.read("media/textures/screens.txt");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            dirListing: {
                command: 'php tools/bake.php lib/impact/impact.js lib/game/main.js js/game.min.js',
                options: {
                    stdout: true
                }
            }
        },
        copy: {
            tmp: {
                files: [
                  { src: ['index.html'], dest: 'deploy/tmp/', filter: 'isFile' },
                  { src: ['css/**', 'js/**', 'media/**', '!**/*.txt', '!js/default.js', '!css/snap-view.css'], dest: 'deploy/tmp/' }
                ]
            },
            web: {
                files: [
                  { expand: true, cwd: 'deploy/tmp', src: ['./**'], dest: 'deploy/web/' }
                ]
            },
            blog: {
                files: [
                  { expand: true, cwd: 'deploy/tmp', src: ['./**'], dest: 'deploy/blog/' }
                ]
            },
            wp8: {
                files: [
                  { expand: true, cwd: 'deploy/tmp', src: ['./**', '!**/*.ogg'], dest: 'deploy/wp8/' }
                ]
            }
        },
        clean: {
            deploy: ["deploy"],
            tmp: ["deploy/tmp"]
        },
        replace: {
            gamePath: {
                src: ['deploy/tmp/index.html'],             // source files array (supports minimatch)
                dest: 'deploy/tmp/index.html',             // destination directory or file
                replacements: [{ 
                    from: '<script type="text/javascript" src="lib/impact/impact.js"></script>',                   // string replacement
                    to: '' 
                },
                    {
                        from: 'lib/game/main.js',                   // string replacement
                        to: 'js/game.min.js'
                }]
            },
            textureAtlas: {
                src: ['deploy/tmp/js/game.min.js'],             // source files array (supports minimatch)
                dest: 'deploy/tmp/js/game.min.js',             // destination directory or file
                replacements: [{
                    from: 'entityJSON:null,',
                    to: 'entityJSON:'+ entityJSON+','
                },
                    {
                        from: 'screenJSON:null,',
                        to: 'screenJSON:' + screensJSON + ','
                    }]
            },
            blog: {
                src: ['deploy/blog/js/game.min.js'],
                dest: 'deploy/blog/js/game.min.js', 
                replacements: [{
                    from: 'media',
                    to: '/wp-content/games/super-resident-raver/media/'
                }]
            }
        },
        uglify: {
            tmp: {
                options: {
                    beautify: false,
                    mangle: true
                },
                files: {
                    'deploy/tmp/js/game.min.js': ['deploy/tmp/js/game.min.js']
                }
            }
        },
        express: {
            options: {
                background: true
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        },
        watch: {
            express: {
                files: ['lib/**/*.js'],
                tasks: ['express:dev'],
                options: {
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        }
    });

    
    // Default task(s).
    grunt.registerTask('default', ['express:dev', 'watch']);
    grunt.registerTask('bake', ['shell',
                                'clean:deploy',
                                'copy:tmp',
                                'replace:gamePath',
                                'replace:textureAtlas',
                                'uglify',
                                'copy:web',
                                'copy:wp8',
                                'copy:blog',
                                'replace:blog',
                                'clean:tmp']);
};