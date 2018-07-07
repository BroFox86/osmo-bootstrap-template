"use strict";

/* ==========================================================================
  Variables
  ========================================================================== */

var // Common
  gulp         = require("gulp"),
  gulpSequence = require("gulp-sequence"),
  plumber      = require("gulp-plumber"),
  notify       = require("gulp-notify"),
  del          = require("del"),
  rename       = require("gulp-rename"),
  replace      = require("gulp-replace"),
  run          = require("gulp-run"),
  concat       = require("gulp-concat"),
  flatten      = require("gulp-flatten"),
  changed      = require("gulp-changed"),
  inject       = require("gulp-inject"),
  watch        = require("gulp-watch"),
  browserSync  = require("browser-sync"),
  // HTML
  pug            = require("gulp-pug"),
  pugIncludeGlob = require("pug-include-glob"),
  useref         = require("gulp-useref"),
  htmlbeautify   = require("gulp-html-beautify"),
  htmlmin        = require("gulp-htmlmin"),
  svgstore       = require("gulp-svgstore"),
  cheerio        = require("gulp-cheerio"),
  w3cjs          = require("gulp-w3cjs"),
  // Styles
  sass         = require("gulp-sass"),
  postcss      = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  cssnano      = require("cssnano"),
  mqpacker     = require("css-mqpacker"),
  pxtorem      = require("postcss-pxtorem"),
  uncss        = require("uncss").postcssPlugin,
  // Scripts
  uglify = require("gulp-uglify"),
  // Images
  cache                  = require("gulp-cache"),
  imagemin               = require("gulp-imagemin"),
  responsive             = require("gulp-responsive"),
  imageminSvgo           = require("imagemin-svgo"),
  imageminJpegRecompress = require("imagemin-jpeg-recompress"),
  imageDataURI           = require("gulp-image-data-uri");

/* ==========================================================================
   Paths and parameters
   ========================================================================== */

var paths = {
  plugins: {
    js: [
      "node_modules/bootstrap/js/dist/+(index|util|modal|tab).js"
    ]
  }
};

/* ==========================================================================
   Clean
   ========================================================================== */

gulp.task("clean:tmp", function() {
  console.log("----- Cleaning .tmp folder -----");
  del.sync(".tmp/**");
});

gulp.task("clean:dist", function() {
  console.log("----- Cleaning dist folder -----");
  del.sync("dist/**");
});

gulp.task("clean:cache", function() {
  console.log("----- Cleaning cache -----");
  return cache.clearAll();
});

gulp.task("clean", function(callback) {
  gulpSequence(["clean:tmp", "clean:dist", "clean:cache"])(callback);
});

/* ==========================================================================
   Generate HTML
   ========================================================================== */

gulp.task("html:generate", function() {
  return gulp
    .src("src/*.pug")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(pug({
      basedir: __dirname + "/src",
      plugins: [pugIncludeGlob()]
    }))
    .pipe(inject(gulp.src(".tmp/images/icons.svg"), {
      transform: function (filePath, file) {
        return file.contents.toString("utf8")
      }
    }))
    .pipe(replace("../images/", "images/"))
    .pipe(htmlbeautify({ indent_size: 2 }))
    .pipe(rename(function (path) {
      if (path.basename == "homepage") {
        path.basename = "index";
      }
      return path;
    }))
    .pipe(gulp.dest(".tmp/"));
});

gulp.task("html:dist", function() {
  return (
    gulp
      .src(".tmp/*.html")
      .pipe(
        plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
      )
      .pipe(useref())
      .pipe(gulp.dest("dist/"))
  );
});

// htmlmin won't work together with useref at this time!
gulp.task("html:minify", function() {
  return gulp
    .src("dist/*.html")
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
    .pipe(gulp.dest("dist/"));
});

gulp.task("html", function(callback) {
  gulpSequence(
    ["images:sprites:svg"],
    ["html:generate"]
  )(callback);
});

gulp.task("html:validate", function() {
  return gulp
    .src("dist/[^google]*.html")
    .pipe(w3cjs())
    .pipe(w3cjs.reporter());
});

/* ==========================================================================
   Generate CSS
   ========================================================================== */

gulp.task("styles:custom", function() {
  return gulp
    .src([
      "src/scss/bootstrap.custom.scss",
      "src/assets/scss/*.scss"
    ])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(flatten())
    .pipe(concat("custom.scss"))
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      postcss([
        pxtorem({
          propList: ["*", "!box-shadow"]
        }),
        autoprefixer(),
        // mqpacker()
      ])
    )
    .pipe(gulp.dest(".tmp/css/"));
});

gulp.task("styles", function(callback) {
  gulpSequence("styles:custom")(callback);
});

gulp.task("styles:dist", function() {
  return gulp
    .src("dist/css/*.*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      postcss([
        uncss({
          html: ["dist/[^google]*.html"],
          ignore: [/.*[is,has]-.*/, /.*modal.*/],
          ignoreSheets: [/fonts.googleapis/]
        })
      ])
    )
    .pipe(postcss([cssnano()]))
    .pipe(gulp.dest("dist/css/"));
});

/* ==========================================================================
   Scripts
   ========================================================================== */

gulp.task("scripts:plugins", function() {
  return gulp
    .src(paths.plugins.js)
    .pipe(changed("src/js/"))
    .pipe(gulp.dest("src/js/"));
});

gulp.task("scripts:common", function() {
  return gulp
    .src("src/js/**/*.js")
    .pipe(gulp.dest(".tmp/js/"));
});

gulp.task("scripts:assets", function() {
  return gulp
    .src("src/assets/js/*.js")
    .pipe(concat("custom.js"))
    .pipe(gulp.dest(".tmp/js/"));
});

gulp.task("scripts", function(callback) {
  gulpSequence(
    ["scripts:plugins"],
    ["scripts:common", "scripts:assets"]
  )(callback);
});

gulp.task("scripts:minify", function() {
  return gulp
    .src("dist/js/*.*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/"));
});

/* ==========================================================================
   Optimize images
   ========================================================================== */

gulp.task("images:minify", function() {
  return gulp
    .src([
      "src/assets/images/!(_)*/**/!(*-responsive)*",
      "src/assets/images/!(*-responsive)*.*",
    ])
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
    .pipe(gulp.dest(".tmp/images/"));
});

/* Responsive images
   ========================================================================== */

var respOptions = {
    errorOnUnusedImage: false,
    errorOnUnusedConfig: false,
    errorOnEnlargement: false,
    silent: true,
    quality: 80,
    compressionLevel: 9
  },
  large = "@1.5x",
  huge = "@2x";

gulp.task("images:responsive", function() {
  return gulp
    .src("src/assets/images/**/*-responsive.*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(flatten())
    .pipe(
      responsive(
        {
          "**/*": [
            { width: 700 },
            {
              width: 700 * 1.5,
              rename: { suffix: large }
            },
            {
              width: 700 * 2,
              rename: { suffix: huge }
            }
          ]
        },
        respOptions
      )
    )
    .pipe(gulp.dest(".tmp/images/"));
});

/* Data URI images
   ========================================================================== */

gulp.task("images:data-uri", function() {
  gulp
    .src("src/assets/images/_images-to-data-uri/**/!(*.css)*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      imagemin([
        imagemin.optipng(),
        imageminJpegRecompress({
          plugins: [{ target: 10 }]
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

/* SVG sprites
   ========================================================================== */

gulp.task("images:sprites:svg", function() {
  return gulp
    .src("src/assets/images/_images-to-svg-sprite/**/*.svg")
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
          // $("path").removeAttr("fill");
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe(rename("icons.svg"))
    .pipe(gulp.dest(".tmp/images/"))
});

/* Images: build and test
   ========================================================================== */

gulp.task("images", function(callback) {
  gulpSequence(
    ["images:minify", "images:responsive"]
  )(callback);
});

gulp.task("images:dist", function() {
  return gulp
    .src(".tmp/images/**/!(icons.svg)*")

    // For external SVG sprite
    // .src(".tmp/images/**")
    .pipe(gulp.dest("dist/images/"));
});

/* ==========================================================================
   Copy videos
   ========================================================================== */

gulp.task("videos", function(callback) {
  return gulp
    .src("src/assets/videos/**")
    .pipe(flatten())
    .pipe(changed(".tmp/videos/"))
    .pipe(gulp.dest(".tmp/videos/"));
});

gulp.task("videos:dist", function() {
  return gulp
    .src(".tmp/videos/*")
    .pipe(gulp.dest("dist/videos/"));
});

/* ==========================================================================
   Copy fonts
   ========================================================================== */

gulp.task("fonts", function() {
  return gulp
    .src("src/assets/fonts/**")
    .pipe(changed(".tmp/fonts/"))
    .pipe(gulp.dest(".tmp/fonts/"));
});

gulp.task("fonts:dist", function() {
  return gulp.src("src/assets/fonts/**").pipe(gulp.dest("dist/fonts/"));
});

/* ==========================================================================
   Watch the files
   ========================================================================== */

gulp.task("watch", function() {
  watch(
    [
      "src/assets/images/_images-to-svg-sprite/**/*.svg"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("html");
    }
  );

  watch(
    [
      "src/includes/*.pug",
      "src/layouts/*.*",
      "src/*.pug"
    ],
    { readDelay: 200 },
    function () {
      gulp.start("html:generate");
    }
  );

  watch(
    [
      "src/assets/scss/*.scss", 
      "src/scss/**"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("styles");
    }
  );

  watch(
    [
      "src/assets/images/!(_)*/**",
      "src/assets/images/*.*"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("images");
    }
  );

  watch("src/videos/**", { readDelay: 200 }, function() {
    gulp.start("videos");
  });

  watch(
    [
      "src/assets/js/*.js", 
      "src/js/**/*.js"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("scripts");
    }
  );

  watch("src/assets/fonts/*", { readDelay: 200 }, function() {
    gulp.start("fonts");
  });
});

/* ==========================================================================
   Launch local server
   ========================================================================== */

gulp.task("connect:tmp", function() {
  browserSync.init({
    server: ".tmp/",
    notify: false,
    open: false,
    reloadDebounce: 500
  });
  browserSync.watch(".tmp/*.html").on("change", browserSync.reload);
  browserSync.watch(".tmp/css/main.css").on("change", browserSync.reload);
  browserSync.watch(".tmp/js/*").on("change", browserSync.reload);
  browserSync.watch(".tmp/fonts/*").on("change", browserSync.reload);
});

gulp.task("connect:dist", function() {
  browserSync.init({
    server: "dist/",
    notify: false,
    open: false
  });
});

/* ==========================================================================
   Build & deploy
   ========================================================================== */

gulp.task("prebuild", function(callback) {
  gulpSequence(
    [
    "videos", 
    "images", "scripts", "fonts", "html", "styles"
    ]
  )(callback);
});

gulp.task("build", function(callback) {
  gulpSequence(
    ["clean"],
    ["prebuild"],
    ["html:dist"],
    ["html:minify", "styles:dist", "scripts:minify", "images:dist", "videos:dist", "fonts:dist"],
    ["html:validate"]
  )(callback);
});

/* ==========================================================================
   Main tasks
   ========================================================================== */

gulp.task("serve", function(callback) {
  gulpSequence(["prebuild"], ["connect:tmp"], ["watch"])(callback);
});

gulp.task("default", ["serve"], function() {});
