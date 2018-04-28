const gulp = require('gulp');
const webpack = require('webpack-stream');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const changed = require('gulp-changed');
const watch = require('gulp-watch');
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const processhtml = require('gulp-processhtml');
const replace = require('gulp-replace');
const clean = require('gulp-clean');
const sequence = require('gulp-sequence');
// 处理es2016 es2017
const babel = require('gulp-babel');
// 处理sass
const sass = require('gulp-sass');
// 处理css
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const base64 = require('gulp-base64');
const pxtovw = require('./postcss-plugin-pxtoviewport/index');
const cleanCss = require('gulp-clean-css');
// 配置文件
const postcssPlugins = [autoprefixer(), pxtovw({
    viewportWidth: 375,
    toRem: true,
    rootValue: 16
})];

const rootDir = '../docs/';
const outDir = '../src/';
const distDir = '../dist/';
const distUrl = './';
const date = new Date().getTime();

// 转css
const convertToCss = function () {
    return gulp.src(rootDir + 'scss/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(changed(outDir + "/css", { extension: ".css", hasChanged: changed.compareLastModifiedTime }))
        .pipe(sass())
        .pipe(base64({
            extensions: ['png'],
            maxImageSize: 20 * 1024
        }))
        .pipe(postcss(postcssPlugins))
        .pipe(gulp.dest(outDir + 'css'))
        .pipe(reload({ stream: true }));
};

// 转Js
const convertToJs = function () {
    return gulp.src(rootDir + 'js/*.js')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(changed(outDir + 'js', {extension: '.js', hasChanged: changed.compareLastModifiedTime}))
        .pipe(webpack({
            output: {
                filename: 'bundle.js'
            }
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(outDir + 'js'))
        .pipe(reload({ stream: true }));
};

// 合并压缩Js库
const concatJs = function () {
    return gulp.src(outDir + 'lib/js/*.js')
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(distDir + 'lib/js'));
};

// 合并压缩Css库
const concatCss = function () {
    return gulp.src(outDir + 'lib/css/*.css')
        .pipe(concat('libs.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest(distDir + 'lib/css'));
};

// 合并压缩Js
const minifyJs = function () {
    return gulp.src(outDir + 'js/*.js')
        .pipe(concat('bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(distDir + 'js'));
};

// 合并压缩Css
const minifyCss = function () {
    return gulp.src(outDir + 'css/*.css')
        .pipe(concat('main.min.css'))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(replace(/_VERSION_/gi, date))
        .pipe(gulp.dest(distDir + 'css'))
};

// 处理html
const htmlHandler = function () {
    return gulp.src(outDir + '*.html')
        .pipe(processhtml())
        .pipe(replace(/_VERSION_/gi, date))
        .pipe(replace(/href=\"css/gi, 'href=\"' + distUrl + 'css'))
        .pipe(replace(/src=\"lib/gi, 'src=\"'+ distUrl +'lib'))
        .pipe(replace(/src=\"js/gi, 'src=\"'+ distUrl +'js'))
        .pipe(gulp.dest(distDir))
};

const cleanBuild = function () {
    return gulp.src(distDir)
        .pipe(clean({force: true}))
        .pipe(gulp.dest(distDir));
};

/**
 * ================ 任务 =======================
 */
// serve
gulp.task('serve', function(){
    return browserSync.init({
        server: outDir
    });
});

// 编译babel
gulp.task('compile', function(){
    convertToJs();
    return watch(rootDir + 'js/*.js', function(){
        convertToJs();
    });
});

// 处理sass
gulp.task('sass', function(){
    convertToCss();
    return watch(rootDir + 'scss/*.scss', function(){
        convertToCss();
    });
});
/**
 * ================= build =================
 */
gulp.task('minify-js', function () {
    return minifyJs();
});

gulp.task('minify-css', function () {
    return minifyCss();
});

gulp.task('concat-js', function () {
    return concatJs();
});

gulp.task('concat-css', function () {
    return concatCss();
});

gulp.task('html-handler', function () {
    return htmlHandler();
});

gulp.task('clean-build', function () {
    return cleanBuild();
});
/**
 *  =============== 运行 ======================
 */
// 打开web服务: gulp
gulp.task('default', ['compile', 'sass', 'serve']);

// 打包编译：gulp build
gulp.task('build', sequence(
    'clean-build',
    'concat-js',
    'concat-css',
    'minify-js',
    'minify-css',
    'html-handler'
));