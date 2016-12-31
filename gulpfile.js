// Modules
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var notify = require("gulp-notify");

// Default-Task
gulp.task("default", ["watch"]);

// Watch-Task
gulp.task("watch", function() {
    gulp.watch("src/js/*.js", ["js"]);
    gulp.watch("src/data/**/*", ["data"]);
});

// Data-Task
gulp.task("data", function() {
    return gulp.src("src/data/**/")
        .pipe(gulp.dest("./cli/data"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "Data: Copied <%= file.relative %>.",
        }));
});

// JSHint-Task
gulp.task("jshint", function() {
    return gulp.src("src/js/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(jshint.reporter("fail"))
        .on("error", notify.onError({
            title: "Gulp",
            message: "<%= error.message %>",
            sound: "Basso",
            icon: "Terminal Icon",
        }));
});

// JavaScript-Task
gulp.task("js", ["jshint"], function() {
    return gulp.src([
            "src/js/modules.js",
            "src/js/constants.js",
            "src/js/functions.js",
            "src/js/commands.js",
            "src/js/program.js"
        ])
        .pipe(concat("cli.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./cli"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JS: Compiled <%= file.relative %>.",
        }));
});
