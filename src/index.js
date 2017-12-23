/* @flow */

const FontFile = require("./FontFile");
const CSSLength = require("css-length");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const exists = promisify(fs.exists);

/*::
type Options = {
  inputFile: string,
  outputFile?: string,
  letterSpacing: string | number,
  baseFontSize?: string | number,
  log: boolean
};
*/

module.exports = async function makeSpacedFont(
  {
    inputFile,
    outputFile,
    letterSpacing,
    baseFontSize,
    log = false
  } /*: Options */
) /*: Promise<string> */ {
  if (!await exists(inputFile)) {
    if (log) {
      process.stderr.write(`\nFile not found: ${inputFile}\n\n`);
    }
    throw new Error(`File not found: ${inputFile}`);
  }
  baseFontSize = baseFontSize || "16px";
  if (typeof letterSpacing === "number") {
    letterSpacing = "" + letterSpacing;
  }
  if (typeof baseFontSize === "number") {
    baseFontSize = "" + baseFontSize;
  }
  if (/\d$/.test(baseFontSize)) {
    baseFontSize += "px";
  }

  if (/\d$/.test(letterSpacing)) {
    letterSpacing += "px";
  }

  if (log) {
    process.stdout.write(
      `\nAdding ${letterSpacing} of space based on a font size of ${baseFontSize}`
    );
  }

  letterSpacing =
    Number.parseFloat(new CSSLength(letterSpacing).em) /
    Number.parseFloat(new CSSLength(baseFontSize).em);

  if (log) {
    process.stdout.write(` -> ${letterSpacing}em\n\n`);
  }

  if (!outputFile) {
    const dir = path.dirname(inputFile);
    const ext = path.extname(inputFile);
    outputFile = path.join(
      dir,
      path.basename(inputFile, ext) + ".space-" + letterSpacing + "em" + ext
    );
    if (await exists(outputFile)) {
      if (log) {
        process.stderr.write(`\nNot overwriting ${outputFile}\n\n`);
      }
      throw new Error(`File already exists: ${outputFile}`);
    }
  }

  const font = new FontFile(inputFile);
  await font.save(outputFile, {
    letterSpacing
  });
  if (log) {
    process.stdout.write(`Font written to ${outputFile}\n\n`);
  }
  return outputFile;
};
