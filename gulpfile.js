const {src, dest, series, watch} = require('gulp');
const sass = require('sass');
const gulpSass = require('gulp-sass');
const htmlMin = require('gulp-htmlmin');
const typograf = require('gulp-typograf');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const imageMin = require('gulp-imagemin')
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const webp = require('gulp-webp');
const browserSync = require('browser-sync').create()

const mainSass = gulpSass(sass);

const clean = () => {
	return del(['dist'])
}

const resources = () => {
    return src('./src/resources/**')
      .pipe(dest('dist/libs'))
  }

const htmlInclude = () => {
	return src(['src/*.html'])
		.pipe(fileinclude({
			prefix: '@',
			basepath: '@file'
		}))
        .pipe(typograf({
            locale: ['ru', 'en-US']
          }))
		.pipe(dest('dist'))
		.pipe(browserSync.stream());
}

const styles = () => {
    return src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(mainSass()).on('error', notify.onError())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css/'))
    .pipe(browserSync.stream())
}


const svgSprites = () => {
	return src('src/img/svg/**/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg"
				}
			}
		}))
		.pipe(dest('dist/img'))
}

const images = () => {
    return src([
        'src/img/**/*.jpg',
        'src/img/**/*.png',
        'src/img/*.svg',
        'src/img/**/*.jpeg',
    ])
    .pipe(imageMin())
    .pipe(dest('dist/img'))
}

const webpImages = () => {
    return src(['src/img/**/*.{jpg,jpeg,png}'])
      .pipe(webp())
      .pipe(dest('dist/img'))
  };


const scripts = () => {
    src('src/js/libs/**/*.js')
        .pipe(concat('vendor.js'))
        .pipe(dest('dist/js'))
    return src([
        'src/js/main.js',
        'src/js/components/**/*.js'
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream())
}

const fonts = () => {
	src('src/fonts/**/*.ttf')
		.pipe(ttf2woff())
		.pipe(dest('dist/fonts/'))
	return src('./src/fonts/**/*.ttf')
		.pipe(ttf2woff2())
		.pipe(dest('dist/fonts/'))
}


const watchFiles = () => {
    browserSync.init({
        server:{
            baseDir: 'dist'
        }   
    })
}



watch('src/*.html', htmlInclude)
watch('src/scss/**/*.scss', styles)
watch('src/images/svg/**/*.svg', svgSprites)
watch('src/img/**/*.jpg', images)
watch('src/img/**/*.png', images)
watch('src/img/**/*.jpeg', images)
watch('src/js/**/*.js', scripts)
watch('src/resources/**', resources)
watch('src/fonts/**/*.ttf', fonts)
watch('{src/img/**/*.{jpg,jpeg,png}', webpImages)

exports.clean = clean;
exports.styles = styles;
exports.watchFiles = watchFiles;
exports.htmlInclude = htmlInclude;
exports.scripts = scripts;


exports.default = series(clean, resources, htmlInclude, scripts, fonts, svgSprites, images, webpImages, styles, watchFiles);




const stylesBuild = () => {
    return src('src/scss/**/*.scss')
    .pipe(mainSass())
    .pipe(autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(dest('dist/css/'))
}


const scriptsBuild = () => {
    src('src/js/libs/**/*.js')
        .pipe(concat('vendor.js'))
        .pipe(uglify().on("error", notify.onError()))
        .pipe(dest('dist/js'))
    return src([
        'src/js/main.js',
        'src/js/components/**/*.js'
    ])
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify().on("error", notify.onError()))
        .pipe(dest('dist/js'))
}


const htmlBuild = () => {
	return src(['src/*.html'])
		.pipe(fileinclude({
			prefix: '@',
			basepath: '@file'
		}))
        .pipe(htmlMin({
            collapseWhitespace: true,
        }))
		.pipe(dest('dist'))
}



exports.build = series(clean, htmlBuild, scriptsBuild, fonts, resources, svgSprites, images, webpImages, stylesBuild);