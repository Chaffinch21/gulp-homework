
const {src, dest, series, watch} = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefixes = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const notify= require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const gulpif = require('gulp-if');
const argv = require('yargs').argv;

const clean = () => {
  return del(['dist']);
}

const resources = () => {
  return src('src/resources/**')
  .pipe(dest('dist'));
}

const styles = () => {
  return src('src/styles/**/*.css')
  .pipe(gulpif(argv.prod!=true, sourcemaps.init()))
  .pipe(concat('main.css'))
  .pipe(autoprefixes({
    cascade: false,
  }))
  .pipe(gulpif(argv.prod, cleanCss({
    level: 2,
  })))
  .pipe(gulpif(argv.prod!=true, sourcemaps.write()))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const htmlMinify = () => {
  return src('src/**/*.html')
  .pipe(gulpif(argv.prod, htmlMin({
    collapseWhitespace: true,
  })))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/images/svg/**/*.svg')
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: '../sprite.svg'
      }
    }
  }))
  .pipe(dest('dist/images'))
}

const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
  .pipe(gulpif(argv.prod!=true, sourcemaps.init()))
  .pipe(gulpif(argv.prod, babel({
    presets: ['@babel/env']
  })))
  .pipe(concat('app.js'))
  .pipe(gulpif(argv.prod, uglify().on('error', notify.onError())))
  .pipe(gulpif(argv.prod!=true, sourcemaps.write()))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}

const images = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/*.svg',
    'src/images/**/*.png',
    'src/images/**/*.jpeg'
  ])
  .pipe(gulpif(argv.prod, image()))
  .pipe(dest('dist/images'))
}

watch('src/**/*.html', htmlMinify);
watch('src/**/*.css', styles);
watch('src/images/svg/**/*.svg', svgSprites);
watch('src/js/**/*.js', scripts);
watch('src/resources/**', resources);

exports.styles = styles;
exports.scripts = scripts;
exports.htmlMinify = htmlMinify;
exports.default = series(clean, resources, htmlMinify, styles, images, svgSprites, scripts, watchFiles);