const gulp = require('gulp');
const watch = require('gulp-watch');
const sequence = require('gulp-sequence');

const utils = require('./util');
const config = require('./config');

/**
 * ================ 任务 =======================
 */
// serve
gulp.task('serve', function(){
    return utils.serve();
});

// 编译babel
gulp.task('compile', function(){ 
    return watch(config.rootDir + 'js/*.js', function(){
        return utils.convertToJs();
    });
});

// 处理sass
gulp.task('sass', function(){
    return watch(config.rootDir + 'scss/*.scss', function(){
        return utils.convertToCss();
    });
});

// 处理html
gulp.task('html', function(){
    return watch(config.rootDir + '*.html', function(){
        return utils.watchHtml();
    })
});

// 审查 拷贝库
gulp.task('vendor', function(){
    return watch(config.rootDir + 'lib/**/*.*', function(){
        return utils.watchVendor();
    });
});

// 审查 拷贝资源
gulp.task('assets', function(){
    return watch(config.rootDir + 'assets/**/*.*', function(){
        return utils.watchAssets();
    });
});
/**
 * ================= build =================
 */
gulp.task('minify-js', function () {
    return utils.minifyJs();
});

gulp.task('minify-css', function () {
    return utils.minifyCss();
});

gulp.task('concat-js', function () {
    return utils.concatJs();
});

gulp.task('concat-css', function () {
    return utils.concatCss();
});

gulp.task('html-handler', function () {
    return utils.htmlHandler();
});

gulp.task('copy-assets', function(){
    return utils.assetsHandler();
});

gulp.task('clean-build', function () {
    return utils.cleanBuild();
});

/**
 *  =============== 运行 ======================
 */
// 打开web服务: gulp
gulp.task('default', ['serve', 'compile', 'sass', 'html', 'vendor', 'assets']);

// 打包编译：gulp build
gulp.task('build', sequence(
    'clean-build',
    'concat-js',
    'concat-css',
    'minify-js',
    'minify-css',
    'html-handler',
    'copy-assets'
));