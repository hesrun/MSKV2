// ========================= Setings folders =================================

const project_folder = 'dist' // or require("path").basename(__dirname)
const source_folder = 'src'

// ===========================================================================
// =========================== Setings Path ==================================

const path = {
    src: {
        html: [
            source_folder + '/html/*.html',
            '!' + source_folder + '/html/_*.html',
        ],
        css: [
            source_folder + '/scss/**/*.scss',
            '!' + source_folder + '/scss/**/_*.svg',
        ],
        js: source_folder + '/js/**/*.js',
        img: [
            source_folder + '/img/**/*.+(png|jpg|jpeg|gif|ico|webp|svg)',
            '!' + source_folder + '/img/sprite.svg',
        ],
        svg: source_folder + '/img/sprite/*.svg',
        fonts: source_folder + '/fonts/*.+(otf|ttf|woff|woff2)',
    },
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.+(png|jpg|jpeg|gif|ico|webp|svg)',
        svg: source_folder + '/img/sprite/*.svg',
    },
    clean: './' + project_folder + '/',
}

// ===========================================================================
// =========================== Gulp plugins ==================================

const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const fileInclude = require('gulp-file-include')
const prettyHtml = require('gulp-pretty-html')
const scss = require('gulp-sass')(require('sass'))
const autoPrefixer = require('gulp-autoprefixer')
const groupMedia = require('gulp-group-css-media-queries')
const cleanCss = require('gulp-clean-css')
const rename = require('gulp-rename')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const cheerio = require('gulp-cheerio')
const svgSprite = require('gulp-svg-sprite')
const babel = require('gulp-babel')
const del = require('del')
const fs = require('fs')

// ===========================================================================
// ============================= All Setings =================================

gulp.task('html', function () {
    // setting html
    return gulp
        .src(path.src.html)
        .pipe(
            fileInclude({
                prefix: '@',
                basepath: '@file',
            })
        )
        .pipe(
            prettyHtml({
                indent_size: 3,
            })
        )
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream())
})

gulp.task('css', function () {
    // setting styles
    return (
        gulp
            .src(path.src.css)
            .pipe(
                scss({
                    outputStyle: 'expanded', // or compressed
                })
            )
            //.pipe(groupMedia())
            .pipe(
                autoPrefixer({
                    cascade: true,
                })
            )
            .pipe(gulp.dest(path.build.css)) // if need also not-clean version
            .pipe(cleanCss())
            .pipe(
                rename({
                    extname: '.min.css',
                })
            )
            .pipe(gulp.dest(path.build.css))
            .pipe(browserSync.stream())
    )
})

gulp.task('js', function () {
    // setting scripts
    return gulp
        .src(path.src.js)
        .pipe(
            fileInclude({
                prefix: '@',
                basepath: '@file',
            })
        )
        .pipe(concat('main.js'))
        .pipe(
            babel({
                presets: ['@babel/preset-env'],
            })
        )
        .pipe(gulp.dest(path.build.js)) // if need also not-uglify version
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js',
            })
        )
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream())
})

gulp.task('img', function () {
    // setting image
    return gulp
        .src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: true }],
                interlaced: true,
                optimizationLevel: 5, // 0 to 7
            })
        )
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream())
})

gulp.task('svg', function () {
    // setting svg
    return gulp
        .src(path.src.svg)
        .pipe(
            cheerio({
                run: function ($) {
                    $('[fill]').removeAttr('fill')
                    $('[stroke]').removeAttr('stroke')
                    $('[style]').removeAttr('style')
                    $('[viewBox]').removeAttr('viewBox')
                    $('[opacity]').removeAttr('opacity')
                },
            })
        )
        .pipe(
            svgSprite({
                mode: {
                    symbol: {
                        sprite: '../sprite.svg',
                        //example: true,
                    },
                },
            })
        )
        .pipe(gulp.dest(path.build.img))
})

gulp.task('fonts', function () {
    // setting fonts
    return gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts))
})

gulp.task('browser-sync', function () {
    // setting server
    browserSync.init({
        server: {
            baseDir: './' + project_folder + '/',
        },
        port: 3000,
        notify: false,
    })
})

gulp.task('clean', function () {
    // setting clean
    return del(path.clean)
})

gulp.task('watch', function () {
    // setting watch
    gulp.watch([path.watch.html], gulp.parallel('html'))
    gulp.watch([path.watch.css], gulp.parallel('css'))
    gulp.watch([path.watch.js], gulp.parallel('js'))
    gulp.watch([path.watch.img], gulp.parallel('img'))
    gulp.watch([path.watch.svg], gulp.parallel('svg'))
})

// ===========================================================================
// ======================== custom gulp tasks ================================

gulp.task(
    'build',
    gulp.series(
        'clean',
        gulp.parallel('html', 'js', 'img', 'css', 'fonts', 'svg')
    )
)

// ===========================================================================
// =============== default function, after command "gulp" ====================

gulp.task(
    'default',
    gulp.series('build', gulp.parallel('watch', 'browser-sync'))
)

// ===========================================================================
