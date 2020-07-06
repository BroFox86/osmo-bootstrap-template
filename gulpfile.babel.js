/*
 * Run 'gulp' or 'gulp serve' to make a prebuild
 * in the .tmp/ folder and watch it.
 *
 * Run 'gulp build' to build project in the dist/ folder.
 *
 * Run 'gulp connectToDist' to start local server in the dist/ folder.
 */

"use strict";

/* ==========================================================================
  Plugins
  ======================================================================== */

const {
  task, src, lastRun, dest, watch, series, parallel, symlink
} = require("gulp");

import del from "del";
import browserSync from "browser-sync";
import pugIncludeGlob from "pug-include-glob";
import useref from "gulp-useref";

// PostCSS plugins
import autoprefixer from "autoprefixer";
import uncss from "postcss-uncss";
import cssnano from "cssnano";
import pxtorem from "postcss-pxtorem";

// Imagemin plugins
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import imageminJpegRecompress from "imagemin-jpeg-recompress";

// Plug the rest via gulp-load-plugins
import loadPlugins from "gulp-load-plugins";
const plugins = loadPlugins();

/* ==========================================================================
  Paths & options
  ======================================================================== */

const paths = {
  plugins: {
    js: [
      "node_modules/bootstrap/js/dist/+(index|util|modal|tab).js",
    ],
    css: [
      ""
    ]
  }
};

const options = {
  jpegRecompress: {
    quality: "medium"
  },
  pngquant: {
    quality: [0.9, 1]
  },
  uncss: {
    ignore: [/.*[is,has]-.*/, /.*modal.*/],
  },
  pxToRem: {
    propList: ["*", "!box-shadow", "!border*"]
  },
  spritesmith: {
    cssTemplate: "sprites.scss.handlebars",
    imgName: "sprite.png",
    cssName: "sprite.scss",
    padding: 2
  },
  responsive: {
    errorOnUnusedImage: false,
    errorOnUnusedConfig: false,
    errorOnEnlargement: false,
    quality: 70,
    compressionLevel: 6,
    silent: true
  },
  htmlBeautify: {
    indent_size: 2,
    indent_inner_html: true,
    max_preserve_newlines: 1,
    inline: ""
  }
}
/* ==========================================================================
  Local server & Watching
  ======================================================================== */

export function watchFiles() {
  browserSync.init({
    server: ".tmp/",
    notify: false,
    open: false,
    port: 3000,
    reloadDebounce: 500
  });

  watch([
    "src/pug/**/*"
  ], generateHtml);

  watch([
    "src/scss/**"
  ], generateStyles);

  watch("src/js/*", copyScripts);

  watch([
    "src/images/*.*",
    "src/images/*/**",
    "!src/images/_*/**"
  ], optimiseImages);

  watch([
    "src/images/_images-to-responsive/**"
  ], generateResponsiveImages);

  watch("src/fonts/*", prebuildFonts);
}

export function connectToDist() {
  browserSync.init({
    server: "dist/",
    notify: false,
    open: false,
    port: 3002
  });
}

/* ==========================================================================
  HTML
  ======================================================================== */

export function generateHtml() {
  return src("src/pug/pages/*")
    .pipe(
      plugins.pug({
        basedir: __dirname + "/src",
        plugins: [pugIncludeGlob()]
      })
      .on("error", plugins.notify.onError())
    )
    .pipe(plugins.htmlBeautify(options.htmlBeautify))
    .pipe(dest(".tmp/"))
    .pipe(browserSync.stream())
}

export function buildHtml() {
  return src(".tmp/*.html")
    .pipe(useref())
    .pipe(dest("dist/"));
}

// htmlmin won't work together with useref at this time
export function minifyHtml() {
  return src("dist/*.html")
    .pipe(
      plugins.htmlmin({
        collapseWhitespace: false,
        removeComments: true,
        minifyJS: false
      })
    )
    .pipe(dest("dist/"));
}

export function validate() {
  return src("dist/[^google]*.html")
    .pipe(plugins.w3cjs({ showInfo: true }))
    .pipe(plugins.w3cjs.reporter());
}

/* ==========================================================================
  Styles
  ======================================================================== */

export function copyPluginStyles(callback) {
  // Do nothing if there are no sources
  if (paths.plugins.css == "") {
    return callback();
  }

  return src(paths.plugins.css)
    .pipe(plugins.rename({
      extname: ".scss"
    }))
    .pipe(dest("src/scss/vendors/"));
}

export function generateStyles() {
  return src([
    "src/scss/main.scss",
    "src/scss/vendors/*"
  ])
    .pipe(plugins.sassGlob())
    .pipe(
      plugins.sass({ outputStyle: "expanded" })
      .on("error", plugins.sass.logError))
      .on("error", plugins.notify.onError()
    )
    .pipe(
      plugins.postcss([
        autoprefixer(),
        // pxtorem({
        //   propList: options.pxToRem.propList
        // })
      ])
    )
    .pipe(dest(".tmp/css/"))
    .pipe(browserSync.stream());
}

const prebuildStyles = series(
  copyPluginStyles,
  generateStyles
);

export function buildStyles() {
  return src(".tmp/css/*")
    .pipe(
      plugins.postcss([
        uncss({
          html: ["dist/[^google]*.html"],
          ignore: options.uncss.ignore,
          ignoreSheets: [/fonts.googleapis/]
        })
      ])
    )
    .pipe(plugins.postcss([ cssnano() ]))
    .pipe(dest("dist/css/"));
}

/* ==========================================================================
  Scripts
  ======================================================================== */

export function copyPluginScripts(callback) {
  // Do nothing if there are no sources
  if (paths.plugins.js == "") {
    return callback();
  }

  return src(paths.plugins.js)
    .pipe(dest("src/js/vendors"));
}

export function copyScripts() {
  return src("src/js/**", {since: lastRun(copyScripts)})
    .pipe(plugins.flatten())
    .pipe(dest(".tmp/js/"))
    .pipe(browserSync.stream());
}

const prebuildScripts = series(copyPluginScripts, copyScripts);

export function buildScripts() {
  return src("dist/js/*")
    .pipe(plugins.uglify())
    .pipe(dest("dist/js/"));
}

/* ==========================================================================
  Images
  ======================================================================== */

export function optimiseImages() {
  return src([
    "src/images/*.*",
    "src/images/*/**",
    "!src/images/_*/**"
  ], {since: lastRun(optimiseImages)})
    .pipe(plugins.flatten())
    .pipe(
      imagemin([
        imageminPngquant({
          quality: options.pngquant.quality
        }),
        imageminJpegRecompress({
          quality: options.jpegRecompress.quality
        }),
        // imageminSvgo({
        //   plugins: [{
        //     removeViewBox: false
        //   }]
        // })
      ])
    )
    .pipe(dest(".tmp/images/"))
}

export function generateResponsiveImages() {
  const large = "@1.5x";
  const huge = "@2x";

  return src("src/images/_images-to-responsive/*", { since: lastRun(generateResponsiveImages) })
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
        options.responsive
      )
    )
    .pipe(dest(".tmp/images/"))
    .pipe(plugins.wait(1000))
    .pipe(browserSync.stream())
}

function copyImages() {
  return src(".tmp/images/**")
    .pipe(dest("dist/images/"));
}

/* Generate Data URI images
  ======================================================================== */

export function generateDataUri() {
  return src("src/images/_images-to-data-uri/**/!(*.css)*")
    .pipe(
      imagemin([
        imageminPngquant({
          quality: options.pngquant.quality
        }),
        imageminJpegRecompress({
          quality: options.jpegRecompress.quality
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
      dest(function (file) {
        return file.base;
      })
    );
}

/* Generate SVG-sprite
  ======================================================================== */

export function generateSvgSprite() {
  return src("src/images/_images-to-svg-sprite/*")
    .pipe(
      imagemin([
        imageminSvgo({
          plugins: [{ removeViewBox: false }]
        })
      ])
    )
    .pipe(plugins.svgstore())
    .pipe(plugins.rename("icons.svg"))
    .pipe(dest(".tmp/images"))
}

/* ==========================================================================
  Videos
  ======================================================================== */

export function prebuildVideo() {
  return src("src/videos/")
    .pipe(symlink(".tmp/videos/"))
    .pipe(browserSync.stream());
}

export function buildVideo() {
  return src(".tmp/videos/**")
    .pipe(dest("dist/videos/"));
}

/* ==========================================================================
  Fonts
  ======================================================================== */

export function prebuildFonts() {
  return src("src/fonts/")
    .pipe(symlink(".tmp/fonts/"))
    .pipe(browserSync.stream());
}

export function buildFonts() {
  return src(".tmp/fonts/**")
    .pipe(dest("dist/fonts/"));
}

/* ==========================================================================
  Clean
  ======================================================================== */

export function cleanTemp() {
  console.log("----- Cleaning .tmp/ folder -----");
  return del(".tmp/**");
}

export function cleanDist() {
  console.log("----- Cleaning dist/ folder -----");
  return del("dist/**");
}

const clean = series(cleanTemp, cleanDist);

/* ==========================================================================
  Build
  ======================================================================== */

const prebuild = parallel(
  generateHtml,
  prebuildStyles,
  prebuildScripts,
  optimiseImages,
  generateResponsiveImages,
  generateSvgSprite,
  prebuildVideo,
  prebuildFonts
);

const build = series(
  prebuild,
  buildHtml,
  minifyHtml,
  buildScripts,
  buildStyles,
  parallel(
    copyImages,
    buildVideo,
    buildFonts
  ),
  validate
);

const cleanBuild = series(
  clean,
  build
)

/* ==========================================================================
  Main tasks
  ======================================================================== */

// Prebuild and watch files
const serve = series(prebuild, watchFiles);

// Set default task (gulp)
export default serve

// Build
task("build", build);

// Clean build
task("cleanBuild", cleanBuild);

