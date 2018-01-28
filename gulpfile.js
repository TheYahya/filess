'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')

// Compiling sass files
gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public'))
})

// sass files watcher
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass'])
})

// Default gulp task
gulp.task('default', ['sass', 'sass:watch'])
