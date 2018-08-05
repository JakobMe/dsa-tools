/*jshint esversion: 6 */

var gulp = require("gulp");
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var notify = require("gulp-notify");
var chmod  = require("gulp-chmod");
var rename = require("gulp-rename");
var cssmin = require("gulp-cssmin");
var less = require("gulp-less");

function watch() {
    gulp.watch("src/cli/js/*.js", scriptsCli);
    gulp.watch("src/cli/json/*.json", jsonCli);
    gulp.watch("src/web/js/*.js", scriptsWeb);
    gulp.watch("src/web/html/*.html", htmlWeb);
    gulp.watch("src/web/less/*.less", lessWeb);
}

function htmlWeb() {
    return gulp.src("src/web/html/*.html")
        .pipe(gulp.dest("web/"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "HTML: Copied <%= file.relative %>.",
        }));
}

function jsonCli() {
    return gulp.src("src/cli/json/*.json")
        .pipe(gulp.dest("cli/"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JSON: Copied <%= file.relative %>.",
        }));
}

function jshintCli() {
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
}

function jshintWeb() {
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
}

function jsCli() {
    return gulp.src([
            "src/cli/js/modules.js",
            "src/cli/js/utility.js",
            "src/cli/js/string.js",
            "src/cli/js/log.js",
            "src/cli/js/data.js",
            "src/cli/js/update.js",
            "src/cli/js/dice.js",
            "src/cli/js/cost.js",
            "src/cli/js/search.js",
            "src/cli/js/program.js"
        ])
        .pipe(concat("cli.js"))
        .pipe(uglify())
        .on("error", e => console.log(e))
        .pipe(chmod(0o755))
        .pipe(gulp.dest("./cli"))
        .pipe(notify({
            sound: false,
            icon: "Terminal Icon",
            title: "Gulp",
            message: "JS: Compiled <%= file.relative %>.",
        }));
}

function jsWeb() {
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
}

function lessWeb() {
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
}

var scriptsWeb = gulp.series(jshintWeb, jsWeb);
var scriptsCli = gulp.series(jshintCli, jsCli);
var build = gulp.series(scriptsCli, scriptsWeb, jsonCli, htmlWeb, lessWeb);

gulp.task("default", watch);
gulp.task("build", build);
