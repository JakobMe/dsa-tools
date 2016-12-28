// Modules
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var notify = require("gulp-notify");
var babel = require("gulp-babel");

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
            "src/constants.js",
            "src/functions.js",
            "src/commands.js",
            "src/program.js"
        ])
        .pipe(concat("index.js"))
        .pipe(babel({ presets: ["es2015"] }))
        .pipe(uglify())
        .pipe(gulp.dest("./"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JS: Compiled <%= file.relative %>.",
        }));
});
