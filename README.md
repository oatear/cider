<div align="center">

<img src="docs/assets/cider-logo-374.png" width=150px>

## CIDEr
Card IDE (CIDEr) - Design game cards using `HTML/Handlebars`, `CSS`, and `tabular` data.

[![][license]][license-url] 
[![][stars]][gh-url]
[![][release]][gh-url]
[![][last-commit]][gh-url]
[![][website]][pages-url]

Website: [Start using Cider][pages-url]

</div>

# About CIDEr
Cider was created to fill a niche between ease-of-use and versatility. The current market of board game/card creating applications seems to fit
into two categories: 1) advanced software with a steep learning curve and hundreds of pages of documentation, and 2) user-friendly graphical interface, but limited versatility. Cider is absolutely closer to the first category in execution since it currently provides no graphical template editor, but it makes up for the learning curve by using a templating language that many are already familiar with (HTML/Handlebars and CSS).

# 1. Template
Create a template for each of the varying card fronts and card backs using
HTML/Handlebars and CSS. Use variables to reference attributes that
are unique to each card. Use control logic to conditionally display
specific parts of the template.

![screen-1]

## 1.1 Handlebars Helpers

### Card Attributes
Reference any card attribute (names are in kebab case 
Ex. 'Crunch Power' -> 'crunch-power').

    {{card.crunch-power}}

### Assets
Reference any asset (names are in kebab case 
Ex. 'Apple Image' -> 'apple-image').

    <img src="{{assets.apple-image}}"/>

### Repeat
Repeat the contained HTML `n` number of times.

    {{#repeat 5}}
        Any arbitrary HTML
    {{/repeat}}

### Pad Zeros
Pad a given number by `n` zeros.

    {{padZeros card.id 3}}

### Index
Index an object/array with another variable (Ex. assets[card.image]).

    {{index assets card.image}}

### Compile Images
Compile text containing `{{asset-name}}` variables.

    {{compileImages card.description width=100}}

Ex. Description Field

    Convert up to two {{apple}} into a {chip}} each

![image-1]


# 2. Tabulate
Create attributes relevant to your game and fill out their values for each
card.  Choose the front and back templates for each card.

![screen-2]

# 3. Preview
Preview the way the cards look with the tabular data applied to the templates.

![screen-3]

# 4. Export (Work in progress feature)
Export the cards as individual images (PNG), or as card sheets ready to print (PDF). Adjust the paper size, paper margins, and spacing between cards.

![screen-4]

# Creative Ownership
Anything you create using CIDEr is your own intellectual property.
The website hosts nothing and all of your card data and assets sit
in IndexedDB on your browser. You may export and import your entire
database to a .json file to use between devices. You may host your own
version of the CIDEr website by downloading the source code and running `npm install && ng serve`.

The repository itself is protected by AGPL-3.0 to ensure the project remains open-sourced.


[last-commit]: https://img.shields.io/github/last-commit/oatear/cider
[license]: https://badgen.net/github/license/oatear/cider
[stars]: https://badgen.net/github/stars/oatear/cider
[release]: https://badgen.net/github/release/oatear/cider
[website]: https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Foatear.github.io%2Fcider
[logo-url]: docs/assets/cider-logo-80.png
[screen-1]: cider-app/src/assets/screen-1.png
[screen-2]: cider-app/src/assets/screen-2.png
[screen-3]: cider-app/src/assets/screen-3.png
[screen-4]: cider-app/src/assets/screen-4.png
[image-1]: cider-app/src/assets/image-1.png
[gh-url]: https://github.com/oatear/cider
[license-url]: https://github.com/oatear/cider/blob/master/LICENSE.md
[pages-url]: https://oatear.github.io/cider