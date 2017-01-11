// Modules
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var notify = require("gulp-notify");
var chmod  = require("gulp-chmod");
var rename = require("gulp-rename");
var cssmin = require("gulp-cssmin");
var less = require("gulp-less");

// Default-Task
gulp.task("default", ["watch"]);

// Watch-Task
gulp.task("watch", function() {
    gulp.watch("src/cli/js/*.js", ["js-cli"]);
    gulp.watch("src/cli/json/*.json", ["json-cli"]);
    gulp.watch("src/web/js/*.js", ["js-web"]);
    gulp.watch("src/web/html/*.html", ["html-web"]);
    gulp.watch("src/web/less/*.less", ["less-web"]);
});

// HTML-Task
gulp.task("html-web", function() {
    return gulp.src("src/web/html/*.html")
        .pipe(gulp.dest("web/"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "HTML: Copied <%= file.relative %>.",
        }));
});

// JSON-Task
gulp.task("json-cli", function() {
    return gulp.src("src/cli/json/*.json")
        .pipe(gulp.dest("cli/"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JSON: Copied <%= file.relative %>.",
        }));
});

// JSHint-Task
gulp.task("jshint-cli", function() {
    return gulp.src("src/cli/js/*.js")
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

// JSHint-Task
gulp.task("jshint-web", function() {
    return gulp.src("src/web/js/index.js")
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
gulp.task("js-cli", ["jshint-cli"], function() {
    return gulp.src([
            "src/cli/js/modules.js",
            "src/cli/js/utility.js",
            "src/cli/js/string.js",
            "src/cli/js/log.js",
            "src/cli/js/data.js",
            "src/cli/js/update.js",
            "src/cli/js/dice.js",
            "src/cli/js/search.js",
            "src/cli/js/program.js"
        ])
        .pipe(concat("cli.js"))
        .pipe(uglify({ preserveComments: "license" }))
        .pipe(chmod(0o755))
        .pipe(gulp.dest("./cli"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JS: Compiled <%= file.relative %>.",
        }));
});

// JavaScript-Task
gulp.task("js-web", ["jshint-web"], function() {
    return gulp.src([
            "src/web/js/jquery.js",
            "src/web/js/mustache.js",
            "src/web/js/fuse.js",
            "src/web/js/index.js"
        ])
        .pipe(concat("index.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./web/"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JS: Compiled <%= file.relative %>.",
        }));
});

// LESS-Task
gulp.task("less-web", function() {
    return gulp.src("src/web/less/index.less")
        .pipe(rename("index.css"))
        .pipe(less())
        .on("error", notify.onError({
            title: "Gulp",
            message: "<%= error.message %>",
            sound: "Basso",
            icon: "Terminal Icon",
            wait: true
        }))
        .pipe(cssmin())
        .pipe(gulp.dest("web/"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "LESS: Compiled <%= file.relative %>.",
        }));
});
