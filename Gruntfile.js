module.exports = function( grunt ) {
	grunt.initConfig({  
        pkg: grunt.file.readJSON('package.json'),  
        clean: {
          build: {
            src: [ 'build' ]
          },
        },
        copy:{
            build:{
                expand:true,
                cwd:'src/',
                src: ['**','!**/*.js','!**/*.css'],  
                dest: 'build/'
            }
        },
        uglify: {              
            build: {  
              expand:true,
              cwd:'src/',
              src: '**/*.js',  
              dest: 'build/'
            }  
        },
        cssmin: {
          build: {  
              expand:true,
              cwd:'src/',
              src: '**/*.css',  
              dest: 'build/'
            } 
        },
        htmlmin: {
          options:{
            removeComments: true,
            minifyCSS:true,
            minifyJS:true,
            collapseWhitespace: true
          },
          build: {             
              expand:true,
              cwd:'src/',
              src: ['**/*.html','**/*.htm','**/*.xml'],  
              dest: 'build/'
            } 
        }
    }); 
    grunt.loadNpmTasks('grunt-contrib-clean');    
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');  
    grunt.registerTask('build', ['clean','copy','cssmin','htmlmin','uglify']);  
    grunt.registerTask('default', ['build']);  
   
};
