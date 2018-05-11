const gulp = require('gulp');
const webpack = require('webpack-stream');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const changed = require('gulp-changed');
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const processhtml = require('gulp-processhtml');
const replace = require('gulp-replace');
const clean = require('gulp-clean');
// 处理es2016 es2017
const babel = require('gulp-babel');
// 处理sass
const sass = require('gulp-sass');
// 处理css
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const base64 = require('gulp-base64');
const pxtovw = require('postcss-plugin-pxtoviewport');
const cleanCss = require('gulp-clean-css');
const config = require('./config');
// 配置文件
const postcssPlugins = [autoprefixer({ "browsers": ["iOS >= 7","Firefox >= 20","Android >= 4.0"]}), pxtovw(config.pxtorem)];

module.exports = {
    // 启动服务
    serve: function () {
        return browserSync.init({
            server: config.outDir
        });
    },
    // 观察html
    watchHtml: function(){
        return gulp.src(config.outDir + '*.html')
            .pipe(changed(config.outDir + "*.html", { extension: ".html", hasChanged: changed.compareLastModifiedTime }))
            .pipe(reload({stream: true}));
    },
    // 转css
    convertToCss: function () {
        return gulp.src(config.rootDir + 'scss/*.scss')
            .pipe(plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            }))
            .pipe(changed(config.outDir + "/css", { extension: ".css", hasChanged: changed.compareLastModifiedTime }))
            .pipe(sass())
            .pipe(base64({
                extensions: ['png'],
                maxImageSize: 20 * 1024
            }))
            .pipe(postcss(postcssPlugins))
            .pipe(gulp.dest(config.outDir + 'css'))
            .on('end', reload);
    },
    // 转Js
    convertToJs: function () {
        return gulp.src(config.rootDir + 'js/*.js')
            .pipe(plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            }))
            .pipe(changed(config.outDir + 'js', {extension: '.js', hasChanged: changed.compareLastModifiedTime}))
            .pipe(webpack({
                output: {
                    filename: 'bundle.js'
                }
            }))
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(gulp.dest(config.outDir + 'js'))
            .pipe(reload({ stream: true }));
    },
    // 合并压缩Js库
    concatJs: function () {
        return gulp.src(config.outDir + 'lib/js/*.js')
            .pipe(concat('vendor.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest(config.distDir + 'lib/js'));
    },
    // 合并压缩Css库
    concatCss: function () {
        return gulp.src(config.outDir + 'lib/css/*.css')
            .pipe(concat('vendor.min.css'))
            .pipe(cleanCss())
            .pipe(gulp.dest(config.distDir + 'lib/css'));
    },
    // 合并压缩Js
    minifyJs: function () {
        return gulp.src(config.outDir + 'js/*.js')
            .pipe(concat('bundle.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest(config.distDir + 'js'));
    },
    // 合并压缩Css
    minifyCss: function () {
        return gulp.src(config.outDir + 'css/*.css')
            .pipe(concat('main.min.css'))
            .pipe(cleanCss({compatibility: 'ie8'}))
            .pipe(replace(/_VERSION_/gi, config.date))
            .pipe(gulp.dest(config.distDir + 'css'));
    },
    // 处理html
    htmlHandler: function () {
        return gulp.src(config.outDir + '*.html')
            .pipe(processhtml())
            .pipe(replace(/_VERSION_/gi, config.date))
            .pipe(replace(/href=\"css/gi, 'href=\"' + config.distUrl + 'css'))
            .pipe(replace(/src=\"lib/gi, 'src=\"'+ config.distUrl +'lib'))
            .pipe(replace(/src=\"js/gi, 'src=\"'+ config.distUrl +'js'))
            .pipe(gulp.dest(config.distDir))
    },
    // 清除文件
    cleanBuild: function () {
        return gulp.src(config.distDir)
            .pipe(clean({force: true}));
    }
};