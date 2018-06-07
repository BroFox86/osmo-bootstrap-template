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
  responsive = require("gulp-responsive"),
  unusedImages = require("gulp-unused-images");

/* ==========================================================================
   Paths and parameters
   ========================================================================== */

var paths = {
  src: {
    root: "src/",
    components: "src/components/",
    pug: "src/pug/",
    styles: "src/scss/",
    images: "src/images/",
    imagesToSprite: "src/images/_images-to-sprite/",
    respImages: "src/images/_responsive-images/",
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
    js: [
      "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
      "node_modules/svg4everybody/dist/svg4everybody.js"
    ]
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
    .pipe(replace("../images/", "images/"))
    .pipe(htmlbeautify({ indent_size: 2 }))
    .pipe(gulp.dest(paths.tmp.root));
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
      paths.src.styles + "bootstrap.custom.scss",
      paths.src.styles + "[^bootstrap]*.scss",
      paths.src.components + "**/*.scss"
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
          selectorBlackList: [
            /\.container(-fluid)?/,
            /^(\.form)?(\.)?(-)?(row)$/,
            /(\.col)(-)?(\d{1,2})?(\w{2})?(-)?(\d{1,2})?/
          ]
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
    .src(["./!(*-responsive*|_*|sprite.svg)", "./[^_]*/**/!(*-responsive*)"], { cwd: paths.src.images })
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
    .src(paths.src.images + "**/*-responsive.*")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(flatten())
    .pipe(
      responsive(
        {
          "**/play-on*": [
            { width: 700 },
            {
              width: 700 * 1.5,
              rename: { suffix: large }
            },
            {
              width: 700 * 2,
              rename: { suffix: huge }
            }
          ],
          "**/devices-fun*": [
            { width: 600 },
            {
              width: 600 * 1.5,
              rename: { suffix: large }
            },
            {
              width: 600 * 2,
              rename: { suffix: huge }
            }
          ],
          "**/girl-playing-table-wide*": [
            { width: 960 },
            {
              width: 960 * 1.5,
              rename: { suffix: large }
            },
            {
              width: 960 * 2,
              rename: { suffix: huge }
            }
          ]
        },
        respOptions
      )
    )
    .pipe(gulp.dest(paths.tmp.images));
});

/* SVG sprites
   ========================================================================== */

gulp.task("images:sprites:svg", function() {
  return gulp
    .src(paths.src.imagesToSprite + "**/*.svg")
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
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(paths.tmp.images))
    .pipe(browserSync.stream());
});

/* Images: build and testing
   ========================================================================== */

gulp.task("images:prebuild", function(callback) {
  gulpSequence([
    "images:sprites:svg",
    "images:minify",
    "images:responsive"
  ])(callback);
});

gulp.task("images:build", function() {
  return gulp
    .src("**", { cwd: paths.tmp.images })
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

/* ==========================================================================
   Videos
   ========================================================================== */

gulp.task("videos:prebuild", function(callback) {
  return gulp
    .src(paths.src.videos + "**")
    .pipe(changed(paths.tmp.images))
    .pipe(gulp.dest(paths.tmp.videos));
});

gulp.task("videos:build", function() {
  return gulp.src(paths.tmp.videos + "*").pipe(gulp.dest(paths.dist.videos));
});

/* ==========================================================================
   Scripts
   ========================================================================== */

gulp.task("js:plugins", function() {
  return gulp
    .src(paths.plugins.js)
    .pipe(changed(paths.tmp.js))
    .pipe(gulp.dest(paths.tmp.js));
});

gulp.task("js:common", function() {
  return gulp
    .src(paths.src.js + "**")
    .pipe(changed(paths.tmp.js))
    .pipe(gulp.dest(paths.tmp.js));
});

gulp.task("js:main", function() {
  return gulp
    .src(paths.src.components + "**/*.js")
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
   Fonts
   ========================================================================== */

gulp.task("fonts:prebuild", function() {
  return gulp
    .src(paths.src.fonts + "**")
    .pipe(changed(paths.tmp.fonts))
    .pipe(gulp.dest(paths.tmp.fonts));
});

gulp.task("fonts:build", function() {
  return gulp.src(paths.src.fonts + "**").pipe(gulp.dest(paths.dist.fonts));
});

/* ==========================================================================
   Misc
   ========================================================================== */

gulp.task("root-files", function() {
  return gulp.src(paths.src.root + "*.*").pipe(gulp.dest(paths.dist.root));
});

/* ==========================================================================
   Watch
   ========================================================================== */

gulp.task("watch", function() {
  watch(
    [paths.src.components + "*/*.pug", paths.src.pug + "**"],
    { readDelay: 200 },
    function() {
      gulp.start("html:generate");
    }
  );

  watch(
    [paths.src.components + "*/*.scss", paths.src.styles + "**"],
    { readDelay: 200 },
    function() {
      gulp.start("styles:prebuild");
    }
  );

  watch(
    [paths.src.images + "[^_]*/**", paths.src.images + "[^_]*"],
    { readDelay: 200 },
    function() {
      gulp.start("images:prebuild");
    }
  );

  watch(paths.src.imagesToSprite + "**", { readDelay: 200 }, function() {
    gulp.start("images:sprites:svg");
  });

  watch(paths.src.videos + "**", { readDelay: 200 }, function() {
    gulp.start("videos:prebuild");
  });

  watch(
    [paths.src.components + "*/*.js", paths.src.js + "**"],
    { readDelay: 200 },
    function() {
      gulp.start("js:prebuild");
    }
  );

  watch(paths.src.fonts + "**", { readDelay: 200 }, function() {
    gulp.start("fonts:prebuild");
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
    ["html:generate"],
    ["styles:prebuild"],
    ["images:prebuild", "videos:prebuild", "js:prebuild", "fonts:prebuild"]
  )(callback);
});

gulp.task("build", function(callback) {
  gulpSequence(
    ["clean:all"],
    ["prebuild"],
    ["html:build"],
    [
      "html:minify",
      "styles:build",
      "js:minify",
      "images:build",
      "videos:build",
      "fonts:build"
    ],
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
