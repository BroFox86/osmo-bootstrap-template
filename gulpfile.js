"use strict";

/* ==========================================================================
  Variables
  ========================================================================== */

var
  gulp                   = require("gulp"),
  watch                  = require("gulp-watch"),
  del                    = require("del"),
  run                    = require("gulp-run"),
  browserSync            = require("browser-sync"),
  pugIncludeGlob         = require("pug-include-glob"),
  autoprefixer           = require("autoprefixer"),
  pxtorem                = require("postcss-pxtorem"),
  uncss                  = require("uncss").postcssPlugin,
  cssnano                = require("cssnano"),
  mqpacker               = require("css-mqpacker"),
  imagemin               = require("gulp-imagemin"),
  imageminJpegRecompress = require("imagemin-jpeg-recompress"),
  imageminPngquant       = require("imagemin-pngquant"),
  imageminSvgo           = require("imagemin-svgo"),

  // Plug the rest via gulp-load-plugins
  plugins = require('gulp-load-plugins') ();

/* ==========================================================================
   Paths and options
   ========================================================================== */

var paths = {
  plugins: {
    js: [
      "node_modules/bootstrap/js/dist/+(index|util|modal|tab).js",
      "node_modules/objectFitPolyfill/dist/objectFitPolyfill.basic.min.js"
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

gulp.task("clean", function(cb) {
  plugins.sequence(["clean:tmp", "clean:dist"])(cb);
});

/* ==========================================================================
   HTML
   ========================================================================== */

gulp.task("html:generate", function() {
  return gulp
    .src("src/*.pug")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(plugins.pug({
      basedir: __dirname + "/src",
      plugins: [pugIncludeGlob()]
    }))
    .pipe(plugins.inject(gulp.src(".tmp/images/icons.svg"), {
      transform: function (filePath, file) {
        return file.contents.toString("utf8")
      }
    }))
    .pipe(plugins.replace("../images/", "images/"))
    .pipe(plugins.htmlBeautify({ indent_size: 2 }))
    .pipe(gulp.dest(".tmp/"));
});

gulp.task("html:build", function() {
  return (
    gulp
      .src(".tmp/*.html")
      .pipe(
        plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
      )
      .pipe(plugins.useref())
      .pipe(gulp.dest("dist/"))
  );
});

// htmlmin won't work together with useref at this time!
gulp.task("html:minify", function() {
  return gulp
    .src("dist/*.html")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      plugins.htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true
      })
    )
    .pipe(gulp.dest("dist/"));
});

gulp.task("html:prebuild", function(cb) {
  plugins.sequence(
    ["images:sprites:svg"],
    ["html:generate"]
  )(cb);
});

gulp.task("html:validate", function() {
  return gulp
    .src("dist/[^google]*.html")
    .pipe(plugins.w3cjs())
    .pipe(plugins.w3cjs.reporter());
});

/* ==========================================================================
   Styles
   ========================================================================== */

gulp.task("styles:custom", function() {
  return gulp
    .src([
      "src/scss/bootstrap.custom.scss",
      "src/components/*/*.scss"
    ])
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(plugins.flatten())
    .pipe(plugins.concat("main.scss"))
    .pipe(plugins.sass({ outputStyle: "expanded" }).on("error", plugins.sass.logError))
    .pipe(
      plugins.postcss([
        pxtorem({
          propList: ["*", "!box-shadow"]
        }),
        autoprefixer(),
        // mqpacker()
      ])
    )
    .pipe(gulp.dest(".tmp/css/"));
});

gulp.task("styles:prebuild", function(cb) {
  plugins.sequence("styles:custom")(cb);
});

gulp.task("styles:build", function() {
  return gulp
    .src("dist/css/*.*")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      plugins.postcss([
        uncss({
          html: ["dist/[^google]*.html"],
          ignore: [/.*[is,has]-.*/, /.*modal.*/],
          ignoreSheets: [/fonts.googleapis/]
        })
      ])
    )
    .pipe(plugins.postcss([cssnano()]))
    .pipe(gulp.dest("dist/css/"));
});

/* ==========================================================================
   Scripts
   ========================================================================== */

gulp.task("scripts:plugins", function() {
  return gulp
    .src(paths.plugins.js)
    .pipe(plugins.changed(".tmp/js/"))
    .pipe(gulp.dest(".tmp/js/"));
});

gulp.task("scripts:common", function() {
  return gulp
    .src("src/js/**/*.js")
    .pipe(gulp.dest(".tmp/js/"));
});

gulp.task("scripts:assets", function() {
  return gulp
    .src("src/js/*.js")
    .pipe(plugins.concat("custom.js"))
    .pipe(gulp.dest(".tmp/js/"));
});

gulp.task("scripts:prebuild", function(cb) {
  plugins.sequence(
    ["scripts:plugins"],
    ["scripts:common", "scripts:assets"]
  )(cb);
});

gulp.task("scripts:build", function() {
  return gulp
    .src("dist/js/*.*")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(plugins.uglify())
    .pipe(gulp.dest("dist/js/"));
});

/* ==========================================================================
   Images
   ========================================================================== */

gulp.task("images:copy", function() {
  return gulp
    .src([
      "src/images/!(_)*/**/!(*-responsive)*",
      "src/images/!(*-responsive)*.*",
    ])
    .pipe(plugins.flatten())
    .pipe(gulp.dest(".tmp/images/"));
});

/* Responsive images
   ========================================================================== */

var respOptions = {
    errorOnUnusedImage: false,
    errorOnUnusedConfig: false,
    errorOnEnlargement: false,
    quality: 100,
    silent: true,
    compressionLevel: 1
  },
  large = "@1.5x",
  huge = "@2x";

gulp.task("images:responsive", function() {
  return gulp
    .src("src/images/**/*-responsive.*")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(plugins.flatten())
    .pipe(
      plugins.responsive(
        {
          "**/*": [
            { width: 1000 },
            {
              width: 1000 * 1.5,
              rename: { suffix: large }
            },
            {
              width: 1000 * 2,
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
    .src("src/images/_images-to-data-uri/**/!(*.css)*")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      imagemin([
        imagemin.optipng(),
        imageminJpegRecompress({
          quality: "low"
        }),
        imageminSvgo({
          plugins: [{ removeViewBox: false }]
        })
      ])
    )
    .pipe(
      plugins.imageDataUri({
        template: {
          file: "data-uri-template.css"
        }
      })
    )
    .pipe(plugins.concat("_backgrounds.css"))
    .pipe(
      gulp.dest(function(file) {
        return file.base;
      })
    );
});

/* SVG sprite
   ========================================================================== */

gulp.task("images:sprites:svg", function() {
  return gulp
    .src("src/images/_images-to-svg-sprite/**/*.svg")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      imagemin([
        imageminSvgo({
          plugins: [{ removeViewBox: false }]
        })
      ])
    )
    .pipe(plugins.svgstore({ inlineSvg: true }))
    .pipe(
      plugins.cheerio({
        run: function($, file) {
          $("svg").attr("style", "display: none");
          // $("path").removeAttr("fill");
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe(plugins.rename("icons.svg"))
    .pipe(gulp.dest(".tmp/images/"))
});

/* Images
   ========================================================================== */

gulp.task("images:build", function () {
  return gulp
    .src(".tmp/images/**/!(icons.svg)*")
    .pipe(
      plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      imagemin([
        imageminPngquant({
          quality: 90
        }),
        imageminJpegRecompress({
          quality: "low"
        })
      ])
    )
    .pipe(plugins.flatten())
    .pipe(gulp.dest("dist/images/"));
});

gulp.task("images:prebuild", function(cb) {
  plugins.sequence(
    ["images:copy", "images:responsive"]
  )(cb);
});

/* ==========================================================================
   Videos
   ========================================================================== */

gulp.task("videos:prebuild", function() {
  return gulp
    .src("src/videos/**")
    .pipe(plugins.flatten())
    .pipe(plugins.changed(".tmp/videos/"))
    .pipe(gulp.dest(".tmp/videos/"));
});

gulp.task("videos:build", function() {
  return gulp
    .src(".tmp/videos/*")
    .pipe(gulp.dest("dist/videos/"));
});

/* ==========================================================================
   Fonts
   ========================================================================== */

gulp.task("fonts:prebuild", function() {
  return gulp
    .src("src/fonts/**")
    .pipe(plugins.changed(".tmp/fonts/"))
    .pipe(gulp.dest(".tmp/fonts/"));
});

gulp.task("fonts:build", function() {
  return gulp.src("src/fonts/**").pipe(gulp.dest("dist/fonts/"));
});

/* ==========================================================================
   Watch
   ========================================================================== */

gulp.task("watch", function() {
  watch(
    [
      "src/images/_images-to-svg-sprite/**/*.svg"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("html:prebuild");
    }
  );

  watch(
    [
      "src/layouts/*.*",
      "src/pug/**/*",
      "src/includes/*.pug",
      "src/*.pug"
    ],
    { readDelay: 200 },
    function () {
      gulp.start("html:generate");
    }
  );

  watch(
    [
      "src/scss/*.scss",
      "src/scss/**"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("styles:prebuild");
    }
  );

  watch(
    [
      "src/images/!(_)*/**",
      "src/images/*.*"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("images:prebuild");
    }
  );

  watch("src/videos/**", { readDelay: 200 }, function() {
    gulp.start("videos:prebuild");
  });

  watch(
    [
      "src/js/*.js",
      "src/js/**/*.js"
    ],
    { readDelay: 200 },
    function() {
      gulp.start("scripts:prebuild");
    }
  );

  watch("src/fonts/*", { readDelay: 200 }, function() {
    gulp.start("fonts:prebuild");
  });
});

/* ==========================================================================
   Start local server
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
   Build
   ========================================================================== */

gulp.task("prebuild", function (cb) {
  plugins.sequence(
    [
      "html:prebuild",
      "styles:prebuild",
      "images:prebuild",
      "videos:prebuild",
      "scripts:prebuild",
      "fonts:prebuild",
    ]
  )(cb);
});

gulp.task("build", function(cb) {
  plugins.sequence(
    ["clean"],
    ["prebuild"],
    ["html:build"],
    [
      "html:minify",
      "styles:build",
      "images:build",
      "videos:build",
      "scripts:build",
      "fonts:build"
    ],
    ["html:validate"]
  )(cb);
});

/* ==========================================================================
   Main tasks
   ========================================================================== */

gulp.task("serve", function(cb) {
  plugins.sequence(["prebuild"], ["connect:tmp"], ["watch"])(cb);
});

gulp.task("default", ["serve"], function() {});
