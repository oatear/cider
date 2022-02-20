<div align="center">

<img src="docs/assets/cider-logo-374.png" width=150px>

## CIDEr
Card IDE (CIDEr) - Design playing cards using `HTML/Handlebars`, `CSS`, and `tabular` data.

[![][license]][license-url] 
[![][stars]][gh-url]
[![][release]][gh-url]
[![][last-commit]][gh-url]
[![][website]][pages-url]

Website: [Start using Cider][pages-url]

</div>

## About CIDEr
Cider was created to fill a niche between ease-of-use and versatility. The current market of board game/card creating applications seems to fit
into two categories: 1) advanced software with a steep learning curve and hundreds of pages of documentation, and 2) user-friendly graphical interface, but limited versatility. Cider is absolutely closer to the first category in execution since it currently provides no graphical template editor, but it makes up for the learning curve by using a templating language that many are already familiar with (HTML/Handlebars and CSS).

## 1. Template
Create a template for each of the varying card fronts and card backs using
HTML/Handlebars and CSS. Use variables to reference attributes that
are unique to each card. Use control logic to conditionally display
specific parts of the template.

## 2. Tabulate
Create attributes relevant to your game and fill out their values for each
card.  Choose the front and back templates for each card.

## 3. Preview
Preview the cards the way they look with the tabular data applied to the templates.

## 4. Export (Work in progress feature)
Export the cards as individual images, or as card sheets ready to print.
Adjust the paper size and spacing between cards.  Choose the export format (PDF, PNG).

## Creative Ownership
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
[gh-url]: https://github.com/oatear/cider
[license-url]: https://github.com/oatear/cider/blob/master/LICENSE.md
[pages-url]: https://oatear.github.io/cider