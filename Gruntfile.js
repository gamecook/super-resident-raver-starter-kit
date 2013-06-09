module.exports = function (grunt) {

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
    });

    grunt.loadNpmTasks('grunt-shell');
    
    // Default task(s).
    grunt.registerTask('default', ['shell']);

};