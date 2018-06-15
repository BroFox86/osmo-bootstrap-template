# Osmo bootstrap template

Manually re-created Osmo template from the original one. Сopyright of the content images and videos belongs to the  [Osmo website shop](https://www.playosmo.com/en/).

## Features

* Based on Bootstrap 4.1 as the NPM package
* Responsive web design
* Builded with Pug HTML template engine
* Styled with Sass (SCSS) CSS preprocessor
* Uses PostCSS plugins such as Autoprefixer and PX to REM converter 
* Responsive images via sourceset HTML5 attribute and CSS3 media queries
* Play/pause videos depending on their position on a visible part of a screen (viewport)
* Gradual the high weight content download. Videos are preload after the page is completely loaded
* SVG images are injected into HTML markup
* Gotham font replaced with free alternative Montserrat

## Approach

I tried to follow the same code style and approach which is [recommended](https://getbootstrap.com/docs/4.1/extend/approach/) by the Bootstrap developers:

* Components should be responsive and mobile-first
* Components should be built with a base class and extended via modifier classes
* Whenever possible, prefer a HTML and CSS implementation over JavaScript
* Whenever possible, use utilities over custom styles
* Whenever possible, avoid enforcing strict HTML requirements (children selectors)

Some other style guides and approaches which i followed anyway:

* “6 Gulp Best Practices” by [Cosmin](http://blog.rangle.io/angular-gulp-bestpractices/)
* “HTML/CSS Style Guide” by [Google](https://google.github.io/styleguide/htmlcssguide.html)
* “Principles of writing consistent, idiomatic CSS” by [Necolas](https://github.com/necolas/idiomatic-css)

## Google PSI ratings

[This template](https://brofox86.github.io/osmo-bootstrap-template/):

<!-- Mobile rating: 93/100<br> -->
Desktop rating: 88/100

[Original website](https://www.playosmo.com/en/):

<!-- Mobile rating: 88/100<br> -->
Desktop rating: 56/100