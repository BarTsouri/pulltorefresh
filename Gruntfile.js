/*global module:false*/
module.exports = function (grunt) {
	// Project configuration.

	var sassFileMap = {
		'css/main.css': 'sass/main.scss'
	};
	var cssFileMap = Object.keys(sassFileMap).reduce(function (prev, next) {
		prev[next] = next;
		return prev;
	}, {});


	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.



		postcss: {
			options: {
				//map: true, // inline sourcemaps

				// or
				map: {
					inline: false // save all sourcemaps as separate files...
					//annotation: 'dist/css/maps/' // ...to the specified directory
				},

				processors: [
					//require('pixrem')(), // add fallbacks for rem units
					require('autoprefixer')({browsers: 'last 3 versions'}) // add vendor prefixes
					//require('cssnano')() // minify the result
				]
			},
			dist: {
				files:cssFileMap
			}
		},

		watch: {
			sass: {
				files: [
					'sass/**/*.{scss,sass}'
				],
				tasks: ['sass','postcss']
			}
		},

		sass: {
			options: {
				sourceMap: false
			},
			dist: {
				files: sassFileMap
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-postcss');
};