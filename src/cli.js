#!/usr/bin/env node

const FontFile = require("./FontFile");
const meow = require("meow");
const makeSpacedFont = require("./index");

async function main() {
  const cli = meow(
    `
    Usage
        $ make-spaced-font <input> --letter-spacing=<size> [--base-font-size=<size>] [--output-file=<path>]

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
`,
    {
      flags: {
        outputFile: {
          type: "string",
          alias: "o"
        },
        letterSpacing: {
          type: "string",
          alias: "l"
        },
        baseFontSize: {
          type: "string",
          default: "16px",
          alias: "b"
        }
      }
    }
  );
  if (!cli.input[0] || !cli.flags.letterSpacing) {
    cli.showHelp(64);
  }
  await makeSpacedFont({
    inputFile: cli.input[0],
    ...cli.flags,
    log: true
  });
}

main().catch(e => {
  process.exit(64);
});
