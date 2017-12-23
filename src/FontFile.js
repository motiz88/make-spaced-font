/* @flow */

const fonttools = require("fonttools").default;
const { promisify } = require("util");
const xmljs = require("xml-js");
const fs = require("fs");
const invariant = require("invariant");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const { compile, decompile } = fonttools();

/*::
type TransformOptions = {
  letterSpacing?: number
};
*/

module.exports = class FontFile {
  /*::
  _inputPath: string;
  _srcBin: Buffer;
  _srcParsed: XmlJsRoot;
  */

  constructor(inputPath /*: string */) {
    this._inputPath = inputPath;
  }

  async _load() {
    if (!this._srcBin) {
      this._srcBin = await readFile(this._inputPath);
    }
  }

  async _parse() {
    await this._load();
    if (!this._srcParsed) {
      this._srcParsed = xmljs.xml2js(decompile(this._srcBin), {
        addParent: true
      });
    }
  }

  async save(
    outputPath /*: string */,
    transformOptions /*: TransformOptions */
  ) {
    await this._load();
    await this._parse();
    const transformed = transformParsedFont(this._srcParsed, transformOptions);
    const transformedXml = xmljs.js2xml(transformed);
    const compiled = compile(Buffer.from(transformedXml));
    await writeFile(outputPath, compiled);
  }
};

function findElement(
  parent /*: XmlJsRoot | XmlJsElement */,
  name /*: string */
) /*: XmlJsElement */ {
  invariant(parent.elements, "parent has no elements");
  const child = parent.elements.find(
    el => el.type === "element" && el.name === name
  );
  invariant(child, "child not found");
  invariant(child.type === "element", "child is not an element");
  return child;
}

function findElementByNamePath(
  root /*: XmlJsRoot | XmlJsElement */,
  firstName /*: string */,
  ...names /*: string[] */
) /*: XmlJsElement */ {
  root = findElement(root, firstName);
  for (const name of names) {
    root = findElement(root, name);
  }
  return root;
}

function transformParsedFont(
  parsedFont /*: XmlJsRoot */,
  { letterSpacing = 0 } /*: TransformOptions */ = {}
) /*: XmlJsRoot */ {
  const unitsPerEmElement = findElementByNamePath(
    parsedFont,
    "ttFont",
    "head",
    "unitsPerEm"
  );
  invariant(
    unitsPerEmElement &&
      unitsPerEmElement.attributes &&
      unitsPerEmElement.attributes.value,
    "could not find unitsPerEm"
  );
  const emSize = Number.parseFloat(unitsPerEmElement.attributes.value);

  letterSpacing *= emSize;

  return {
    ...parsedFont,
    elements: parsedFont.elements.map(node => transformNode(node))
  };

  function transformNode(node /*: XmlJsNode */) /*: XmlJsNode */ {
    if (node.type === "element") {
      invariant(node.name, "element has no name");
      switch (node.name) {
        case "mtx": {
          let { width, lsb } = node.attributes || {};
          width = Number.parseFloat(width);
          lsb = Number.parseFloat(lsb);
          if (width !== 0) {
            return {
              ...node,
              attributes: {
                ...node.attributes,
                width: String(width + letterSpacing),
                lsb: String(
                  lsb +
                    letterSpacing / 2 /* / width * (width + letterSpacing) */
                )
              }
            };
          }
        }
      }
      if (node.parent && node.parent.name === "hhea") {
        switch (node.name) {
          case "advanceWidthMax": {
            const { value } = node.attributes || {};
            return {
              ...node,
              attributes: {
                ...node.attributes,
                value: String(Number.parseFloat(value) + letterSpacing)
              }
            };
          }
          case "minLeftSideBearing":
          // falls through
          case "minRightSideBearing": {
            const { value } = node.attributes || {};
            return {
              ...node,
              attributes: {
                ...node.attributes,
                value: String(Number.parseFloat(value) + letterSpacing / 2)
              }
            };
          }
        }
      }
    }
    if (node.elements) {
      return {
        ...node,
        elements: node.elements.map(child => transformNode(child))
      };
    }
    return node;
  }
}
