module.exports = function(grunt) {

	var BUILD_DIR = "build",
		SOURCE_DIR = "src",
		CONFIG_FILE = "config.json",
		PKG_FILE = "package.json";

	grunt.initConfig({
		pkg: grunt.file.readJSON(PKG_FILE),
		html2js: {
			options: {
				base: SOURCE_DIR + "/",
				singleModule: true,
				htmlmin: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true,
					removeComments: true,
					removeEmptyAttributes: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true
				  }
			},
			dist: {
				src: [
					'src/view/*.html'
				],
				dest: BUILD_DIR + '/js/views.min.js'
			}
		},
		concat: {
			options: {
				separator: ';\n'
			},
			dist: {
				src: [
					SOURCE_DIR + '/js/jquery.min.js',
					SOURCE_DIR + '/js/angular.min.js',
					SOURCE_DIR + '/js/exif.js',
					SOURCE_DIR + '/js/jcrop.min.js',
					SOURCE_DIR + '/js/fastclick.js',
					BUILD_DIR + '/js/views.min.js',
					SOURCE_DIR + '/js/widget-controller.js',
					SOURCE_DIR + '/js/*.js'
				],
				dest: BUILD_DIR + '/js/app.min.js'
			}
		},
		cssmin: {
			combine: {
				files: [{
					src: [SOURCE_DIR + '/css/*.css'],
					dest: BUILD_DIR + '/css/styles.min.css'	
				}],
				options: {
					banner: '/* Demo Site Webapp minified css file */',
					keepSpecialComments: 0
				}
			}
		},
		uglify: {
			dist: {
				files: [{
					src: BUILD_DIR + '/js/app.min.js',
					dest: BUILD_DIR + '/js/app.min.js'
				}],
				options: {
					mangle: false
				}
		  }
		},
		copy: {
			main: {
				files: [
					{cwd: SOURCE_DIR + "/", expand: true, src: ['fonts/**'], dest: BUILD_DIR},
					{cwd: SOURCE_DIR + "/", expand: true, src: ['img/**'], dest: BUILD_DIR},
					{cwd: SOURCE_DIR + "/", expand: true, src: ['index.html'], dest: BUILD_DIR}
				]
			}
		},
		clean: {
			temp: {
				src: [BUILD_DIR + '/js/views.min.js']
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [{json: grunt.file.readJSON(CONFIG_FILE)}]
				},
				files: [
					{expand: true, flatten: true, src: [BUILD_DIR + '/index.html'], dest: BUILD_DIR + '/'},
					{expand: true, flatten: true, src: [BUILD_DIR + '/js/app.min.js'], dest: BUILD_DIR + '/js/'},
					{expand: true, flatten: true, src: [BUILD_DIR + '/css/styles.min.css'], dest: BUILD_DIR + '/css/'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-replace');
	grunt.registerTask('install', ['html2js:dist', 'concat:dist', 'cssmin', 'copy:main', 'clean:temp', 'replace:dist']);
	grunt.registerTask('install-min', ['html2js:dist', 'concat:dist', 'cssmin', 'uglify:dist', 'copy:main', 'clean:temp', 'replace:dist']);
};