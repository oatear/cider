<div align="center">

<img src="cider-app/src/assets/cider-logo-512.png" alt="Oatear Cider Logo" width="150">

# Oatear Cider

### The Data-Driven Card Design Studio for Game Developers

Design beautiful game cards with the power and familiarity of `HTML`, `CSS`, and `Handlebars`. Oatear Cider is a modern IDE for card game creation, bridging the gap between simple editors and complex professional software.

[![][license]][license-url] 
[![][stars]][gh-url]
[![][release]][releases-url]
[![][downloads]][releases-url]
[![][last-commit]][gh-url]
[![][website]][pages-url]
[![][discord]][discord-url]

</div>

---

## Get Started

| Platform / Action | Link | Description |
| :--- | :--- | :--- |
| **Web App** | **[Try it Now in Your Browser][pages-url]** | The full experience, running directly in your browser. No installation needed. |
| **Desktop Apps** | **[Free Download (Win, Mac, Linux)][releases-url]** | Get the installable desktop version for offline use and local file system projects. |
| **Mac App Store** | [![][mac-app-store-badge]][mac-app-store-url] | A convenient, sandboxed version for Mac users. Purchase to support the project! |
| **Documentation** | **[Cider Docs][cider-docs-url]** | Detailed documentation for all aspects of Cider with a quick start guide. |
| **Support Us** | [<img src="cider-app/src/assets/kofi-badge.png" alt="Oatear Cider Logo" width="160">][kofi-url] | If you find Cider useful, consider a small donation to support its development! |

---

## About Oatear Cider

Cider was created for designers who want the ultimate creative freedom without a steep learning curve. Instead of a restrictive graphical editor, Cider uses the tools you already know:

-   **Structure with HTML:** Define the layout of your cards with standard HTML.
-   **Style with CSS:** Apply rich styling, from fonts and colors to complex layouts like CSS Grid.
-   **Add Logic with Handlebars:** Use data from a spreadsheet to dynamically change names, stats, and abilities.
-   **See a Sample Project:** Check out the **[Cosmic Apple][cosmic-apple]** sample project to see how it all comes together.

![Cider App Screenshot][screen-1]

## Core Features

| Feature | Description | Screenshot |
| :--- | :--- | :--- |
| **1. Powerful Templates** | Create reusable card templates with HTML & CSS. The Template Wizard helps you quickly set up standard card sizes and layouts. | ![Template Editor][screen-2] |
| **2. Data-Driven Design** | Separate your design from your content. Manage all card attributes in a simple, spreadsheet-like interface. Change data in one place, and update hundreds of cards instantly. | ![Tabular Data Editor][screen-3] |
| **3. Live Preview** | See your cards update in real-time as you edit your templates or data. No more guessing how your changes will look. | ![Live Preview][screen-4] |
| **4. Built-in Simulator** | Instantly playtest your game in the **Game Simulator**—shuffle, draw, and discard without printing a thing. The **Asset Generator** helps you create placeholder art and symbols. | ![Game Simulator][screen-7] |
| **5. Pro-Grade Exports** | Export cards as PNGs or print-ready PDF sheets with crop marks and low-ink modes. You can also export for virtual tabletops like Tabletop Simulator. | ![Export Options][screen-5] |
| **6. Your Project, Your Files** | The desktop app saves your project as a clean folder of `.html`, `.css`, and `.csv` files. Use Git, VS Code, or any other tool in your existing workflow. | ![File Tree][image-file-tree] |

## Installation & Usage

### Web Version
Simply visit **[oatear.github.io/cider][pages-url]** to start. Your projects are stored locally in your browser's IndexedDB. You can import/export your entire project as a single `database.json` file.

### Desktop Version
1.  Go to the **[Releases Page][releases-url]**.
2.  Download the appropriate file for your operating system (`.msi` for Windows, `.dmg` for macOS, `.deb` for Debian/Ubuntu).
3.  **For macOS Users:** For a seamless, signed, and auto-updating experience, please consider purchasing the app from the **[Mac App Store][mac-app-store-url]**.

## Creative Ownership & Licensing
Anything you create with Oatear Cider is your intellectual property. The app collects no data and all your work remains on your local device.

The application source code is protected by the **[AGPL-3.0 License][license-url]** to ensure it remains open-source forever.

## Contributing
We welcome contributions from the community! Whether it's reporting a bug, suggesting a feature, or writing code, your help is appreciated.

Another great way to contribute is by **[supporting the project financially][kofi-url]**. Donations help cover costs like the Apple Developer Program fee and allow us to dedicate more time to development.

-   **Bug Reports & Feature Requests:** Please open an issue on the **[GitHub Issues page](https://github.com/oatear/cider/issues)**.
-   **Development:** Fork the repository, create a new branch, and submit a pull request. To run the project locally, you'll need Node.js and Angular CLI installed.
    ```bash
    # Clone the repository
    git clone https://github.com/oatear/cider.git
    cd cider/cider-app

    # Install dependencies
    npm install

    # Run the app in development mode
    npm start
    ```

---

<div align="center">

*Apple, the Apple Logo, and Mac App Store are trademarks of Apple Inc.*

</div>

<!-- BADGE & IMAGE DEFINITIONS -->
[last-commit]: https://img.shields.io/github/last-commit/oatear/cider
[license]: https://badgen.net/github/license/oatear/cider?cache=600
[stars]: https://img.shields.io/github/stars/oatear/cider
[release]: https://img.shields.io/github/v/release/oatear/cider
[discord]: https://img.shields.io/discord/1129380421642240133?logo=discord&label=discord&color=%23515fe4&link=https%3A%2F%2Fdiscord.gg%2FS66xw9Wc9V
[downloads]: https://img.shields.io/github/downloads/oatear/cider/total
[website]: https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Foatear.github.io%2Fcider
[mac-app-store-badge]: cider-app/src/assets/mac-app-store-badge.svg
[kofi-badge]: cider-app/src/assets/kofi-badge.png
[screen-1]: cider-app/src/assets/screen-1.png
[screen-2]: cider-app/src/assets/screen-2.png
[screen-3]: cider-app/src/assets/screen-3.png
[screen-4]: cider-app/src/assets/screen-4.png
[screen-5]: cider-app/src/assets/screen-5.png
[screen-7]: cider-app/src/assets/screen-7.png
[image-file-tree]: cider-app/src/assets/image-file-tree.png

<!-- URL DEFINITIONS -->
[gh-url]: https://github.com/oatear/cider
[releases-url]: https://github.com/oatear/cider/releases
[cosmic-apple]: https://github.com/oatear/cosmic-apple-game
[cider-docs-url]: https://oatear.github.io/cider-docs/docs/overview/
[license-url]: LICENSE.md
[pages-url]: https://oatear.github.io/cider
[discord-url]: https://discord.gg/S66xw9Wc9V
[mac-app-store-url]: https://apps.apple.com/us/app/oatear-cider/id6749406996?mt=12
[kofi-url]: https://ko-fi.com/oatear