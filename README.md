# make-spaced-font

[![Greenkeeper badge](https://badges.greenkeeper.io/motiz88/make-spaced-font.svg)](https://greenkeeper.io/)

Generate letter-spaced variants of font files.

_This is an experimental tool!_ Please exercise care when using it and report any issues.

## Quick start

Requires Node >= 8.5 and Python 2.7.

```sh
npm install -g make-spaced-font
make-spaced-font lato.ttf --letter-spacing=0.0125em --output-file lato-slightly-spaced.ttf
```

All font types supported by [`fonttools`][fonttools] should work.

[fonttools]: https://github.com/fonttools/fonttools

## Why?

This is mostly useful when building apps for environments that lack runtime control over letter spacing; notably - and where my use case comes from - React Native (at the time of writing, v0.51) only supports the [`letterSpacing`][rn-letterspacing] style property on iOS, and [attempts][pr-1] [to][pr-2] [implement][pr-3] [it][pr-4] it for Android seem to have stalled.

[rn-letterspacing]: https://facebook.github.io/react-native/docs/text.html#style
[pr-1]: https://github.com/facebook/react-native/pull/13877
[pr-2]: https://github.com/facebook/react-native/pull/16801
[pr-3]: https://github.com/facebook/react-native/pull/13199
[pr-4]: https://github.com/facebook/react-native/pull/9420

## How this works

`make-spaced-font` decompiles the font using `fonttools`, changes the advance width and side bearings of all (non-zero-width) glyphs by the desired amount (using half the space on each side), and recompiles the modified font.

The key thing to remember is that when the font is rendered, the spacing **will scale with the font size**. For ease of use, `make-spaced-font` accepts CSS length units, so you can specify the space in `em` or even `px` if you so wish - this gets converted to a relative space using a default base font size of `16px`, which can also be configured.

## CLI

```text
Usage
    $ make-spaced-font <input> --letter-spacing=<size> [options...]

Options
    --letter-spacing, -l    The amount of space to add
    --base-font-size, -b    The base font size [16px]
    --output-file, -o       The output font file

Examples
    $ make-spaced-font foo.ttf --letter-spacing=0.1em
    Adds 0.1em of space

    $ make-spaced-font foo.ttf --letter-spacing=2px
    Adds 2px of space based on a 16px default font size, equivalent to 0.125em.

    $ make-spaced-font foo.ttf --letter-spacing=2px --base-font-size=14px
    Adds 3px of space based on a 14px font size, equivalent to ~0.2143em.
```

## API

```js
const makeSpacedFont = require("make-spaced-font");

makeSpacedFont({
  inputFile: "foo.ttf",
  letterSpacing: "0.1pt", // understands CSS units
  baseFontSize: "18px", // understands CSS units
  outputFile: "foo-spaced.ttf" // optional, derived from inputFile if not specified
}).then(console.log /* resolves with output file name */);
```
