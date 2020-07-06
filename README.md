# Osmo bootstrap template

Manually re-created Osmo shop homepage from the [original one](https://www.playosmo.com/en/). Сopyright of the content (images, videos etc.) belongs to the Tangible Play, Inc.

## Features

* Based on Bootstrap 4.5
* Responsive images via HTML5 attributes and CSS3 media queries
* Extra styles are trimmed by UnCSS
* Play/pause videos depending on their position on the screen
* SVG sprite injected into HTML markup
* Gotham font was replaced by free alternative Montserrat

## Approach

I tried to follow the same code style and approach that is [recommended](https://getbootstrap.com/docs/4.1/extend/approach/) by the Bootstrap developers:

> * Components should be responsive and mobile-first
> * Components should be built with a base class and extended via modifier classes
> * Whenever possible, prefer a HTML and CSS implementation over JavaScript
> * Whenever possible, use utilities over custom styles
> * Whenever possible, avoid enforcing strict HTML requirements (children selectors)

Some other guides and approaches which I followed anyway:

* “6 Gulp Best Practices” by [Cosmin](http://blog.rangle.io/angular-gulp-bestpractices/)
* “HTML/CSS Style Guide” by [Google](https://google.github.io/styleguide/htmlcssguide.html)
* “Principles of writing consistent, idiomatic CSS” by [Necolas](https://github.com/necolas/idiomatic-css)

## How to work with sources

The project uses [Gulp](https://gulpjs.com) — a cross-platform, streaming task runner that automate all development tasks including a build process.

1. Install [Node.js](https://nodejs.org/en/).
2. For Windows, you may need to install a Unix shell command line interface, such as [Git Bash](https://git-scm.com/downloads).
3. Check npm (node package manager) is installed via command prompt: `$ npm`.
4. Run `$ npm install gulp-cli -g` to install Gulp CLI.
5. Check Gulp CLI is installed via `$ gulp --help`.
6. Open terminal from the sources folder and run `$ npm install`.
7. Build the sources if necessary: `$ gulp cleanBuild`.

More information can be found inside [gulpfile.babel.js](gulpfile.babel.js).
