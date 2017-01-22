'use strict';

const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();

const scriptFiles = [
    'index.js'
];

gulp.task('default', ['watch-task'], () => {});

gulp.task('lint-task', () => {
    lint(scriptFiles, {
        useEslintrc: true
    });
});

gulp.task('test-task', () => {
    test('test/**/*.js');
});

gulp.task('watch-task', ['server-task'] ,() => {
    gulp.watch(scriptFiles, ['lint-task']);
});

gulp.task('server-task', () => {
    $.nodemon({
        script: 'index.js'
    })
    .on('start', function() {
        console.log('nodeamon is started');
    });
});

/**
 * ESLintチェック
 */
function lint(files, options) {
    return gulp.src(files)
    .pipe($.eslint(options))
    .pipe($.eslint.format());
}

/**
 * 単体テスト実行
 */
function test(file) {
    return gulp.src(file)
    .pipe($.plumber({
        errorHandler: $.notify.onError('Error: <%= error.message %>')
    }))
    .pipe($.spawnMocha({
        reporter: 'nyan'
    }));
}
