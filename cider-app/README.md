# Cider Application

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.2.

# Useful Commands

## Local server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Electron application

Run `npm run electron` for the electron desktop application.
Run `npm run electron:debug` to start electron with an external debugger.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

# Updating Dependencies

## List outdated dependencies
Run `npm outdated`

## Update all dependencies (from current to wanted)
Run `npm update`

## Update specific dependency
Run `ng update library@version` or `npm update library@version`. If it doesn't work use `ng update library@version --allow-dirty`.

## Save updated versions to package.json
Run `npm update --save`

## Install dependencies from package-lock.json only
Run `npm ci`

## Install updated dependencies from package.json
Run `npm install`

# Other

## Electron application

Run `npm run electron:build` to build the electron desktop application executable.

## Build GitHub Pages (New)

Run `npm run build:gh-pages` to build the site for github pages.
Make sure to copy index.html to 404.html to handle all urls.

## Deploy GitHub Pages

Run `ng build --outputPath=../docs --baseHref=/cider/` to build the site for github pages.
Make sure to copy index.html to 404.html to handle all urls. Replaced by `Build GitHub Pages` above.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## How to create the ICNS (Mac) and ICO (Windows) Icons
Make sure you create a file called `Icon1024.png` in the directory you run these commands.
```
mkdir MyIcon.iconset
sips -z 16 16     Icon1024.png --out MyIcon.iconset/icon_16x16.png
sips -z 32 32     Icon1024.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32     Icon1024.png --out MyIcon.iconset/icon_32x32.png
sips -z 64 64     Icon1024.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128   Icon1024.png --out MyIcon.iconset/icon_128x128.png
sips -z 256 256   Icon1024.png --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256   Icon1024.png --out MyIcon.iconset/icon_256x256.png
sips -z 512 512   Icon1024.png --out MyIcon.iconset/icon_256x256@2x.png
sips -z 512 512   Icon1024.png --out MyIcon.iconset/icon_512x512.png
cp Icon1024.png MyIcon.iconset/icon_512x512@2x.png
iconutil -c icns MyIcon.iconset
convert MyIcon.iconset/icon_16x16.png \
MyIcon.iconset/icon_16x16@2x.png \
MyIcon.iconset/icon_32x32.png \
MyIcon.iconset/icon_32x32@2x.png \
MyIcon.iconset/icon_128x128.png \
MyIcon.iconset/icon_128x128@2x.png \
MyIcon.iconset/icon_256x256.png \
MyIcon.iconset/icon_256x256@2x.png \
MyIcon.iconset/icon_512x512.png \
MyIcon.iconset/icon_512x512@2x.png favicon.ico
rm -R MyIcon.iconset
```

## List available code signing certs
`security find-identity -p codesigning -v`
`security find-identity -v`

## How to update the Mac App Store provision profile
1. Download a new provisioningprofile on the Apple Developer site
2. Encode the downloaded profile 
    `base64 -i cider.provisioningprofile > base64-profile`
3. Upload to GitHub Settings > Secrets and variables > Actions
 - Name: MAS_PROVISIONING_PROFILE
 - Secret: base64 from above

## Start App from Terminal for Troubleshooting Logs
 `open -a Cider.app`

## Read the provisionprofile entitlements (look for <dic> and <key>Entitlements</key>)
 `security cms -D -i build/cider-dev.provisionprofile `

## Read the entitlements claimed by the app
 `codesign --display --entitlements - --xml Cider.app | plutil -convert xml1 -o - -`

## Search for app launch errors in your Console App
 - Search bar: `message type:error`
 - Start streaming logs
 - Launch app
 - Stop streaming logs

# Release new App Store version

## Build for App Store (cmd)
 `npm run electron:build-mas`
 The new .pkg file will be created in the `release/mas-arm64` directory.

## Upload to App Store (Transporter)
1. Open Transporter app
2. Drag the latest `.pkg` file from the `release/mas-arm64` directory
3. Submit to App Store Connect
4. Wait for the app to be processed and approved ('The app is ready for internal testing').
5. If the build shows up as Waiting for Review, it is waiting for approval from the App Store Review team (24 - 48 Hrs)
6. If the build shows up as Ready for Sale, it is ready to be released to the public

## Test the App Store build (Test Flight)
1. Open up Test Flight
2. Select Oatear Cider from the list and click Update

## Publish the App (App Store Connect)
1. Click the ... menu in Transporter and select "View in App Store Connect"

