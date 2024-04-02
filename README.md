# Web Component Boilerplate

A sample project for building and sharing Web Components.

This project requires modern browsers, using modern JavaScript (es6), JavaScript module (esm), modern CSS (css3) and modern HTML (html5).

## Absolute URLs

This project uses absolute URLs to avoid dependency issues. This uses [GulpJS](https://gulpjs.com) (v4) to generate the final code by replacing `{{DEST}}` and ```{{INFIX}}``` placholder strings with the correct absolute URL prefix and a possible ".min" infix. The infix is used for minified files.

Absolute URLs in this project uses [JSDelivr](https://www.jsdelivr.com) CDN. This CDN have access to all branches and tags of any public GitHub repos without additional configuration. Use the [CDN's purge cache page](https://www.jsdelivr.com/tools/purge) after making a `git commit` and `git push`.

View the [dist/CDN-FILES.md](./dist/CDN-FILES.md) for a list absolute URLs in the repo.

## Source Folder (./src)

The source folder holds a sample web component to get started with.

Placeholder strings (`{{DEST}}` and ```{{INFIX}}```) must be used to generate correct absolute URLs. The absolute URLs are generated using GulpJS.

## Distribution Folder (./dist)

The distribution folder contains the "built" web component. This contains the script that is ready to use for web development. This is "built" using GulpJS.

A list of CDN files (CDN-FILES.md) is also generated to make it easier to find the absolute URL for each file.

## Test Folder (./test)

The test folder is used for testing the web component. This is usually done by embedding the new web component inside an HTML and linking to the web component module.

I use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) Visual Studio Code extension to host the test page locally. By default, the GulpJS build process adds the prefix of "/dist/" to the absolute URLs.

## Build Process Using GulpJS 4

[GulpJS 4](https://gulpjs.com) and gulp plugins are dev dependencies for this project. This replaces the `{{DEST}}` and ```{{INFIX}}``` placeholder strings in HTML, CSS and JavaScript files, generate minified versions and create the CDN-FILES.md file.

### Install

This requires the dependencies to be installed before usage. To install the dependencies, use the following command:

```
npm install
```

### Configuration

When using this project as a boilerplate, update the `CDN_URL_PREFIX` constant in the gulpfile.js file to point to the correct repository.

### Build For Testing

```
gulp
```

The default build process. This process replaces `{{DEST}}` placeholder string with `/dist`. This should be used when testing the web component.

### Build With Tag Name

```
gulp --tag [TAG_NAME]
```
This process replaces `{{DEST}}` placeholder string with with the tag name argument. If the tag name is not provided, this process uses the version number specified on the package.json.

Dont forget to commit the branch, add your tag and purge the CDN cache to have the latest code available on the CDN.

### Build With Branch Name

```
gulp --branch
```
This process replaces `{{DEST}}` placeholder string with with `CDN_URL_PREFIX` constant and the current branch name.

The `--branch` flag is ignored when used with the `--tag` flag. Dont forget to commit the branch and purge the CDN cache to have the latest code available on the CDN.

### Build With Minified Files

```
gulp --minify
```

This flag tells the process to also generate minified versions of the HTML, CSS and JavaScript files. Sourcemaps files are also generated for CSS and JavaScript files. Use this flag with the other flags above.

### Build With Clean

```
gulp --clean
```

This flag tells the process to remove the dist folder before building the project. This is to remove old files. Use this flag with the other flags above.
