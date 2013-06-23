module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-open');

    // Project settings
    var rootProject = "./Projects/SuperResidentRaverStarterKitWin8/";
    var wp8Project = "./Projects/SuperResidentRaverStarterKitWP8/";
    var deployDir = "./Deploy/";
    var blogRootPath = '/wp-content/games/super-resident-raver/media/';

    // Add additonal Texture Atlas JSON files here
    var entityJSON = grunt.file.read(rootProject+"media/textures/entities.txt");
    var screensJSON = grunt.file.read(rootProject+"media/textures/screens.txt");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            game: {
                command: [
                    'cd '+deployDir+'/tmp',
                    'php tools/bake.php lib/impact/impact.js lib/game/main.js js/game.min.js'
                ].join('&&'),
                options: {
                    stdout: true
                }
            },
            demos: {
                command: [
                    'cd '+deployDir+'/tmp',
                    'php tools/bake.php lib/impact/impact.js lib/demos/main-demos.js js/demos.min.js'
                ].join('&&'),
                options: {
                    stdout: true
                }
            }
        },
        copy: {
            tmp: {
                files: [
                  { expand: true, cwd: 'Projects/SuperResidentRaverStarterKitWin8/', src: ['index.html'], dest: deployDir+'/tmp/', filter: 'isFile'},
                  { expand: true, cwd: 'Projects/SuperResidentRaverStarterKitWin8/', src: ['css/**', 'js/**', 'lib/**', 'media/**', '!**/*.txt', 'tools/**', '!js/default.js', '!css/snap-view.css'], dest: deployDir+'tmp/' }
                ]
            },
            web: {
                files: [
                  { expand: true, cwd: deployDir+'tmp', src: ['./**'], dest: deployDir+'web/' },
                  { expand: true, cwd: 'Projects/SuperResidentRaverStarterKitWin8/', src: ['demos.html'], dest: deployDir+'/web/', filter: 'isFile'}
                ]
            },
            blog: {
                files: [
                  { expand: true, cwd: deployDir+'tmp', src: ['./**'], dest: deployDir+'blog/' }
                ]
            },
            wp8: {
                files: [
                  { expand: true, cwd: deployDir+'tmp', src: ['./**', '!./media/sounds/*.ogg'], dest: wp8Project+'Html/' },
                  { expand: true, cwd: 'Resources/build/', src: ['console-log-wp8.js'], dest: wp8Project+'Html/js/', filter: 'isFile'}
                ]
            }
            ,
            win8: {
                files: [
                  { expand: true, cwd: deployDir+'tmp', src: ['js/game.min.js'], dest: rootProject, filter: 'isFile'}
                ]
            }
        },
        clean: {
            deploy: ["Deploy"],
            tmp: [deployDir+"tmp"],
            phone: [wp8Project+'Html/'],
            lib: [deployDir+"tmp/tools", deployDir+"tmp/lib"]
        },
        replace: {
            gamePath: {
                src: [deployDir+'tmp/index.html'],             // source files array (supports minimatch)
                dest: deployDir+'tmp/index.html',             // destination directory or file
                replacements: [{ 
                    from: '<script type="text/javascript" src="lib/impact/impact.js"></script>',                   // string replacement
                    to: '' 
                },
                    {
                        from: 'lib/game/main.js',                   // string replacement
                        to: 'js/game.min.js'
                }]
            },
            demosPath: {
                src: [deployDir+'web/demos.html'],             // source files array (supports minimatch)
                dest: deployDir+'web/demos.html',             // destination directory or file
                replacements: [{ 
                    from: '<script type="text/javascript" src="lib/impact/impact.js"></script>',                   // string replacement
                    to: '' 
                },
                    {
                        from: 'lib/demos/main-demos.js',                   // string replacement
                        to: 'js/demos.min.js'
                }]
            },
            textureAtlas: {
                src: [deployDir+'tmp/lib/game/packed-textures.js'],             // source files array (supports minimatch)
                dest: deployDir+'tmp/lib/game/packed-textures.js',             // destination directory or file
                replacements: [{
                    from: 'this.entityJSON',
                    to: entityJSON
                },
                    {
                        from: 'this.screenJSON',
                        to: screensJSON
                    }]
            },
            blog: {
                src: [deployDir+'blog/js/game.min.js'],
                dest: deployDir+'blog/js/game.min.js', 
                replacements: [{
                    from: 'media',
                    to: blogRootPath
                }]
            },
            wp8:{
                src: [wp8Project+'Html/js/resize-game.js'],
                dest: wp8Project+'Html/js/resize-game.js', 
                replacements: [{
                    from: 'gameCanvas.style.marginTop = ',
                    to: 'gameCanvas.style.top = 0;//'
                },
                {
                    from: 'gameCanvas.style.marginLeft = ',
                    to: 'gameCanvas.style.left = 0;//'
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
                    'Deploy/tmp/js/game.min.js': ['Deploy/tmp/js/game.min.js']
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
                files: [rootProject+'lib/**/*.js'],
                tasks: ['express:dev'],
                options: {
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'
            },
            editor: {
                path: 'http://localhost:8080/weltmeister.html'
            },
            web: {
                path: 'http://localhost:8080/Deploy/Web/index.html'
            }
        }
    });

    
    // Default task(s).
    grunt.registerTask('default', ['express:dev', 'open:dev', 'open:editor','watch']);
    grunt.registerTask('bake', ['clean:deploy',
                                'copy:tmp',
                                'replace:textureAtlas',
                                'shell:game',
                                /*'shell:demos',*/
                                'uglify',
                                'clean:lib',
                                'replace:gamePath',
                                'copy:web',
                                /*'replace:demosPath',*/
                                'clean:phone',
                                'copy:wp8',
                                'copy:blog',
                                'replace:blog',
                                'copy:win8',
                                'clean:tmp']);
    grunt.registerTask('debug', ['clean:deploy',
                                'copy:tmp',
                                'replace:textureAtlas',
                                'copy:web',
                                'clean:phone',
                                'copy:wp8',
                                'copy:blog',
                                'replace:blog']);
};