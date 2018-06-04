"use strict";

/* ==========================================================================
  Vars
  ========================================================================== */

var // Common
  gulp = require("gulp"),
  watch = require("gulp-watch"),
  cache = require("gulp-cache"),
  browserSync = require("browser-sync"),
  del = require("del"),
  fs = require("fs"),
  concat = require("gulp-concat"),
  rename = require("gulp-rename"),
  replace = require("gulp-replace"),
  changed = require("gulp-changed"),
  plumber = require("gulp-plumber"),
  notify = require("gulp-notify"),
  gulpSequence = require("gulp-sequence"),
  flatten = require("gulp-flatten"),
  run = require("gulp-run"),
  path = require("path"),
  inject = require("gulp-inject"),
  injectString = require("gulp-inject-string"),
  // HTML
  pug = require("gulp-pug"),
  pugIncludeGlob = require("pug-include-glob"),
  htmlbeautify = require("gulp-html-beautify"),
  htmlmin = require("gulp-htmlmin"),
  useref = require("gulp-useref"),
  cheerio = require("gulp-cheerio"),
  svgstore = require("gulp-svgstore"),
  w3cjs = require("gulp-w3cjs"),
  // Styles
  sass = require("gulp-sass"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  cssnano = require("cssnano"),
  mqpacker = require("css-mqpacker"),
  pxtorem = require("postcss-pxtorem"),
  uncss = require("uncss").postcssPlugin,
  penthouse = require("penthouse"),
  // JS
  uglify = require("gulp-uglify"),
  // Images
  imagemin = require("gulp-imagemin"),
  imageminSvgo = require("imagemin-svgo"),
  imageminJpegRecompress = require("imagemin-jpeg-recompress"),
  imageDataURI = require("gulp-image-data-uri"),
  unusedImages = require("gulp-unused-images");

/* ==========================================================================
   Paths and parameters
   ========================================================================== */

var paths = {
  src: {
    root: "src/",
    components: "src/components/",
    pug: "src/pug/",
    scss: "src/scss/",
    images: "src/images/",
    imagesToSprite: "src/images-to-sprite/",
    imagesToDataUri: "src/images-to-data-uri/",
    favicons: "src/favicons/",
    videos: "src/videos/",
    fonts: "src/fonts/",
    js: "src/js/"
  },
  tmp: {
    root: ".tmp/",
    css: ".tmp/css/",
    images: ".tmp/images/",
    videos: ".tmp/videos/",
    fonts: ".tmp/fonts/",
    js: ".tmp/js/"
  },
  dist: {
    root: "dist/",
    css: "dist/css/",
    js: "dist/js/",
    images: "dist/images/",
    videos: "dist/videos/",
    fonts: "dist/fonts/"
  },
  plugins: {
    js: ["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"]
  }
};

/* ==========================================================================
   Cleaning
   ========================================================================== */

gulp.task("clean:tmp", function() {
  console.log("----- Cleaning .tmp folder -----");
  del.sync(paths.tmp.root + "**");
});

gulp.task("clean:dist", function() {
  console.log("----- Cleaning dist folder -----");
  del.sync(paths.dist.root + "**");
});

gulp.task("clean:cache", function() {
  return cache.clearAll();
});

gulp.task("clean:all", function(callback) {
  gulpSequence(["clean:tmp", "clean:dist", "clean:cache"])(callback);
});

/* ==========================================================================
   HTML
   ========================================================================== */

gulp.task("html:generate-svg", function() {
  return gulp
    .src([
      paths.src.imagesToSprite + "*.svg",
      paths.src.components + "*/images-to-sprite/*.svg"
    ])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      imagemin([
        imageminSvgo({
          plugins: [{ removeViewBox: false }]
        })
      ])
    )
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(
      cheerio({
        run: function($, file) {
          $("svg").attr("style", "display: none");
          $("path").removeAttr("fill");
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe(rename("_sprite.svg"))
    .pipe(gulp.dest(paths.tmp.root));
});

gulp.task("html:generate", function() {
  return gulp
    .src(paths.src.components + "[^_]*/*.pug")
    .pipe(flatten())
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      pug({
        basedir: __dirname + "/src",
        plugins: [pugIncludeGlob()]
      })
    )
    .pipe(
      inject(gulp.src(paths.tmp.root + "_sprite.svg"), {
        transform: function(filePath, file) {
          return file.contents.toString("utf8");
        }
      })
    )
    .pipe(replace("../images/", "images/"))
    .pipe(htmlbeautify({ indent_size: 2 }))
    .pipe(
      rename(function(path) {
        if (path.basename == "homepage") {
          path.basename = "index";
          path.extname = ".html";
        }
        return path;
      })
    )
    .pipe(gulp.dest(paths.tmp.root));
});

gulp.task("html:prebuild", function(callback) {
  gulpSequence(["html:generate-svg"], ["html:generate"])(callback);
});

gulp.task("html:build", function() {
  return gulp
    .src(paths.tmp.root + "*.html")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(useref())
    .pipe(gulp.dest(paths.dist.root));
});

// htmlmin won't work together with useref at this time!
gulp.task("html:minify", function() {
  return gulp
    .src(paths.dist.root + "*.html")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true
      })
    )
    .pipe(gulp.dest(paths.dist.root));
});

gulp.task("html:validate", function() {
  return gulp
    .src(paths.dist.root + "[^google]*.html")
    .pipe(w3cjs())
    .pipe(w3cjs.reporter());
});

/* ==========================================================================
   Styles
   ========================================================================== */

gulp.task("styles:plugins", function() {
  return gulp.src(paths.plugins.css).pipe(gulp.dest(paths.tmp.css));
});

gulp.task("styles:main", function() {
  return gulp
    .src([
      paths.src.scss + "bootstrap.custom.scss",
      paths.src.scss + "[^bootstrap]*.scss",
      paths.src.components + "*/*.scss"
    ])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(flatten())
    .pipe(concat("main.scss"))
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      postcss([
        pxtorem({
          propList: ["*"],
          selectorBlackList: [/\.container(-fluid)?/, /^(\.form)?(\.)?(-)?(row)$/, /(\.col)(-)?(\d{1,2})?(\w{2})?(-)?(\d{1,2})?/]
        }),
        // mqpacker(),
        autoprefixer()
      ])
    )
    .pipe(gulp.dest(paths.tmp.css));
});

gulp.task("styles:prebuild", function(callback) {
  gulpSequence(["styles:main"])(callback);
});

gulp.task("styles:build", function() {
  return gulp
    .src(paths.dist.css + "*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      postcss([
        uncss({
          html: [paths.dist.root + "[^google]*.html"],
          ignore: [/.*[is,has]-.*/],
          ignoreSheets: [/fonts.googleapis/]
        })
      ])
    )
    .pipe(postcss([cssnano()]))
    .pipe(gulp.dest(paths.dist.css));
});

/* ==========================================================================
   Images
   ========================================================================== */

gulp.task("images:minify", function() {
  return gulp
    .src([paths.src.components + "*/images/*", paths.src.images + "**"])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      cache(
        imagemin([
          imagemin.optipng(),
          imageminJpegRecompress({
            plugins: [{ target: 80 }]
          }),
          imageminSvgo({
            plugins: [{ removeViewBox: false }]
          })
        ])
      )
    )
    .pipe(flatten())
    .pipe(gulp.dest(paths.tmp.images));
});

gulp.task("images:data-uri", function() {
  gulp
    .src([
      paths.src.components + "*/images-to-data-uri/*",
      paths.src.imagesToDataUri + "*"
    ])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      imagemin([
        imagemin.optipng(),
        imageminJpegRecompress({
          plugins: [{ target: 80 }]
        }),
        imageminSvgo({
          plugins: [{ removeViewBox: false }]
        })
      ])
    )
    .pipe(
      imageDataURI({
        template: {
          file: "data-uri-template.css"
        }
      })
    )
    .pipe(concat("_backgrounds.css"))
    .pipe(
      gulp.dest(function(file) {
        return file.base;
      })
    );
});

gulp.task("images:prebuild", function(callback) {
  gulpSequence(["images:minify"])(callback);
});

gulp.task("images:copy", function() {
  return gulp
    .src(["**", "!_*"], { cwd: paths.tmp.images })
    .pipe(gulp.dest(paths.dist.images));
});

gulp.task("images:unused", function() {
  return gulp
    .src([
      paths.tmp.root + "*.{html,xml}",
      paths.tmp.css + "*",
      paths.tmp.images + "**/*",
      "!" + paths.tmp.images + "**/*{_original,@*}.*"
    ])
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "Images filter error"
        })
      })
    )
    .pipe(unusedImages())
    .pipe(plumber.stop());
});

gulp.task("videos:prebuild", function(callback) {
  return gulp
    .src([paths.src.videos + "*", paths.src.components + "*/videos/*"])
    .pipe(gulp.dest(".tmp/videos/"));
});

gulp.task("videos:copy", function() {
  return gulp
    .src(paths.tmp.videos + "*")
    .pipe(gulp.dest(paths.dist.videos));
});

/* ==========================================================================
   JavaScript
   ========================================================================== */

gulp.task("js:plugins", function() {
  return gulp
    .src(paths.plugins.js)
    .pipe(changed(paths.tmp.js))
    .pipe(gulp.dest(paths.tmp.js));
});

gulp.task("js:common", function() {
  return gulp
    .src(paths.src.js + "*")
    .pipe(changed(paths.tmp.js))
    .pipe(gulp.dest(paths.tmp.js));
});

gulp.task("js:main", function() {
  return gulp
    .src(paths.src.components + "*/*.js")
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest(paths.tmp.js));
});

gulp.task("js:prebuild", function(callback) {
  gulpSequence(["js:plugins", "js:common", "js:main"])(callback);
});

gulp.task("js:minify", function() {
  return gulp
    .src(paths.dist.js + "*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.js));
});

/* ==========================================================================
   Copying
   ========================================================================== */

gulp.task("copy:fonts:prebuild", function() {
  return gulp
    .src(paths.src.fonts + "*")
    .pipe(changed(paths.tmp.fonts))
    .pipe(gulp.dest(paths.tmp.fonts));
});

gulp.task("copy:fonts:build", function() {
  return gulp.src(paths.src.fonts + "*   ").pipe(gulp.dest(paths.dist.fonts));
});

gulp.task("copy:root-files", function() {
  return gulp.src(paths.src.root + "*.*").pipe(gulp.dest(paths.dist.root));
});

gulp.task("copy:prebuild", function(callback) {
  gulpSequence(["copy:fonts:prebuild"])(callback);
});

gulp.task("copy:build", function(callback) {
  gulpSequence([
    "copy:root-files",
    "copy:fonts:build"
  ])(callback);
});

/* ==========================================================================
   Watch
   ========================================================================== */

gulp.task("watch", function() {
  watch(
    [
      paths.src.imagesToSprite + "*.svg",
      paths.src.components + "*/images-to-sprite/*.svg"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("html:prebuild");
    }
  );

  watch(
    [paths.src.components + "*/*.pug", paths.src.pug + "*"],
    { readDelay: 200 },
    function() {
      gulp.start("html:prebuild");
    }
  );

  watch(
    [paths.src.components + "*/*.scss", paths.src.scss + "*"],
    { readDelay: 200 },
    function() {
      gulp.start("styles:prebuild");
    }
  );

  watch(
    [paths.src.components + "**/*.{jpg,jpeg,png}", paths.src.images + "**"],
    { readDelay: 200 },
    function() {
      gulp.start("images:minify");
    }
  );

  watch(
    [
      paths.src.components + "*/images-to-data-uri/*",
      paths.src.imagesToDataUri + "*"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("images:data-uri");
    }
  );

  watch(
    [paths.src.videos + "*", paths.src.components + "*/videos/*"],
    { readDelay: 200 },
    function() {
      gulp.start("videos:prebuild");
    }
  );

  watch(
    [paths.src.components + "*/*.js", paths.src.js + "*"],
    { readDelay: 200 },
    function() {
      gulp.start("js:prebuild");
    }
  );

  watch(paths.src.fonts + "*", { readDelay: 200 }, function() {
    gulp.start("copy:fonts:prebuild");
  });
});

/* ==========================================================================
   Local server
   ========================================================================== */

gulp.task("connect:tmp", function() {
  browserSync.init({
    server: paths.tmp.root,
    notify: false,
    open: false,
    reloadDebounce: 500
  });
  browserSync.watch(paths.tmp.root + "*.html").on("change", browserSync.reload);
  browserSync.watch(paths.tmp.css + "*").on("change", browserSync.reload);
  browserSync.watch(paths.tmp.js + "*").on("change", browserSync.reload);
  browserSync.watch(paths.tmp.fonts + "*").on("change", browserSync.reload);
});

gulp.task("connect:dist", function() {
  browserSync.init({
    server: paths.dist.root,
    notify: false,
    open: false
  });
});

/* ==========================================================================
   Build & deploy
   ========================================================================== */

gulp.task("prebuild", function(callback) {
  gulpSequence(
    ["html:prebuild"],
    ["styles:prebuild"],
    ["images:prebuild", "videos:prebuild", "js:prebuild", "copy:prebuild"]
  )(callback);
});

gulp.task("build", function(callback) {
  gulpSequence(
    ["clean:all"],
    ["prebuild"],
    ["html:build"],
    ["html:minify", "styles:build", "js:minify", "images:copy", "videos:copy", "copy:build"],
    ["html:validate", "images:unused"]
  )(callback);
});

/* ==========================================================================
   Main tasks
   ========================================================================== */

gulp.task("serve", function(callback) {
  gulpSequence(["prebuild"], ["connect:tmp"], ["watch"])(callback);
});

gulp.task("default", ["serve"], function() {});
