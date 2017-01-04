// Modules
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var notify = require("gulp-notify");
var chmod  = require("gulp-chmod");

// Default-Task
gulp.task("default", ["watch"]);

// Watch-Task
gulp.task("watch", function() {
    gulp.watch("src/*.js", ["js"]);
});

// JSHint-Task
gulp.task("jshint", function() {
    return gulp.src("src/*.js")
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
            "src/modules.js",
            "src/globals.js",
            "src/utility.js",
            "src/string.js",
            "src/log.js",
            "src/data.js",
            "src/update.js",
            "src/dice.js",
            "src/search.js",
            "src/program.js"
        ])
        .pipe(concat("cli.js"))
        .pipe(uglify({ preserveComments: "license" }))
        .pipe(chmod(0o755))
        .pipe(gulp.dest("./"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JS: Compiled <%= file.relative %>.",
        }));
});
