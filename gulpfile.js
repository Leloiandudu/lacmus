'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var notify = require('gulp-notify');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var pkg = require('./package.json')

const userscriptPrologue = `// ==UserScript==
// @name        ${pkg.name}
// @include     https://*.wikipedia.org/*
// @version     ${pkg.version}
// @grant       none
// ==/UserScript==

`;

function createBrowserify() {
   return browserify(Object.assign({
      entries: './src/app.js',
      ignoreWatch: ['**/node_modules/**'],
      poll: true,
   }, watchify.args)).transform('babelify', {
      'presets': [ 'es2015' ],
      'plugins': [ 'transform-runtime', 'transform-async-to-generator' ]
   }).transform('node-lessify', { textMode: true });
}

function runBrowserify(b) {
   const release = !argv.userscript;

   return b
      .bundle()
      .on('error', notify.onError())
      .pipe(gulpif(release, source(`${pkg.name}.js`), userscript(`${pkg.name}.user.js`)))
      .pipe(buffer())
      .pipe(gulpif(release, uglify()))
      .pipe(gulp.dest(release ? './dist/' : `${argv.userscript}/gm_scripts/${pkg.name}/`));
}

function userscript(fn) {
   var stream = source(fn);
   stream.write(userscriptPrologue);
   return stream;
}

gulp.task('javascript', function() {
   return runBrowserify(createBrowserify());
});

gulp.task('watchify', function() {
   var b = watchify(createBrowserify());
   b.on('update', rebundle).on('time', time => notify().write("Done in " + (time / 1000).toFixed(1) + " seconds"));
   return rebundle();

   function rebundle() {
      return runBrowserify(b)
   }
});

gulp.task('watch', [ 'watchify' ]);

gulp.task('default', [ 'javascript' ]);
