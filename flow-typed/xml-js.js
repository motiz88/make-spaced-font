declare module "xml-js" {
  declare module.exports: {
    xml2js(src: string, options?: { addParent?: boolean }): XmlJsRoot,
    js2xml(src: XmlJsRoot): string
  };
}

declare type XmlJsElement = {|
  type: "element",
  elements?: XmlJsNode[],
  name: string,
  attributes?: { [key: string]: string },
  parent?: XmlJsRoot | XmlJsElement
|};

declare type XmlJsText = {|
  type: "text",
  text: string,
  parent?: XmlJsRoot | XmlJsElement
|};

declare type XmlJsComment = {|
  type: "comment",
  comment: string,
  parent?: XmlJsRoot | XmlJsElement
|};

declare type XmlJsNode = XmlJsElement | XmlJsText | XmlJsComment;

declare type XmlJsRoot = {
  declaration: { attributes: { [key: string]: string } },
  elements: XmlJsNode[]
};
