'use strict';

const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpLoadPlugins = require('gulp-load-plugins');

let wiredep = require('wiredep').stream;

const plugins = gulpLoadPlugins();
const sassRoot = 'app/styles';
const cssRoot = 'dist/css';

const views = 'app/views/**/*.html';
const viewsRoot = 'dist/views/';

const controllers = 'app/scripts/controllers';
const controllersRoot = 'dist/scripts/controllers/';

const sounds = 'app/sounds';
const soundsRoot = 'dist/sounds/';

function handleError(err) {
  console.log(err.toString());
}

// ############################################################################################
// ############################################################################################

gulp.task('clean:styles', (cb) => {
  del([
    '**/.sass-cache/**',
  ], cb);
});

gulp.task('inject-dependencies', function() {
  return gulp.src(views)
    .pipe(wiredep())
    .pipe(plugins.rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest(viewsRoot));
});

gulp.task('build-sass', () => {
  return gulp.src(sassRoot+'/*.scss')
    .pipe(plugins.plumber())
    .pipe(plugins.notify('Compile Sass File: <%= file.relative %>...'))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.autoprefixer('last 10 versions'))
    .pipe(plugins.sass({
      style: 'compressed'
    })).on('error', handleError)
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(cssRoot));
});

gulp.task('move-js', () => {
  return gulp.src(controllers+'/*')
    .pipe(gulp.dest(controllersRoot));
});

gulp.task('move-sounds', () => {
  return gulp.src(sounds+'/*.*')
    .pipe(gulp.dest(soundsRoot));
});

// ############################################################################################
// ############################################################################################

gulp.task('watch-sass', () => {
  plugins.notify('Sass Stream is Active...');
  gulp.watch(sassRoot+'/**/*.scss', ['build-sass']);
});

// ############################################################################################
// ############################################################################################

gulp.task('default', ['build-sass', 'inject-dependencies', 'move-js', 'move-sounds'], () => {
  gutil.log('Transposing Sass...');
});

gulp.task('clean', ['clean:styles']);
gulp.task('watch', ['watch-sass']);
