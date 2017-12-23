const fs = require("fs");
const tmp = require("tmp-promise");
const { promisify } = require("util");
const copyFile = promisify(fs.copyFile);
const exists = promisify(fs.exists);

const makeSpacedFont = require("../");

const s544b_ttf = __dirname + "/../../fixtures/s544b.ttf";

describe("makeSpacedFont", () => {
  let dir;
  beforeEach(async () => {
    dir = await tmp.dir({ unsafeCleanup: true });
    await copyFile(s544b_ttf, dir.path + "/s544b.ttf");
  });
  afterEach(() => {
    dir.cleanup();
  });
  test("throws if input doesn't exist", async () => {
    expect.assertions(1);
    try {
      await makeSpacedFont({
        inputFile: "SOME_FILE_THAT_DOES_NOT_EXIST",
        letterSpacing: "1em"
      });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
  test("add 1em to test ttf", async () => {
    const outputFile = dir.path + "/s544b.out.ttf";
    await makeSpacedFont({
      inputFile: dir.path + "/s544b.ttf",
      outputFile,
      letterSpacing: "1em"
    });
    expect(await exists(outputFile)).toBe(true);
  });
  test("add -0.1em to test ttf", async () => {
    const outputFile = dir.path + "/s544b.out.ttf";
    await makeSpacedFont({
      inputFile: dir.path + "/s544b.ttf",
      outputFile,
      letterSpacing: "-0.1em"
    });
    expect(await exists(outputFile)).toBe(true);
  });
  test("add 1px with 12px base to test ttf", async () => {
    const outputFile = dir.path + "/s544b.out.ttf";
    await makeSpacedFont({
      inputFile: dir.path + "/s544b.ttf",
      outputFile,
      letterSpacing: "1px",
      baseFontSize: "12px"
    });
    expect(await exists(outputFile)).toBe(true);
  });
});
