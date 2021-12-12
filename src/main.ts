import MarkdownParser from "./components/parser";
import path from "path";
import MakeHTML from "./components/make-html";
import MakeIndex from "./components/make-index";
import fs from "fs";
import { resolve } from "path/posix";

const parser = new MarkdownParser();

const seekBaseDir = "./";
const extFilter = "md";

const excludeDirectories = [
  "node_modules",
  "public",
  "prh-rules",
  ".devcontainer",
];

let filesList: string[] = [];

const extension = (element: string) => {
  var extName = path.extname(element);
  return extName === "." + extFilter;
};

const parse = async (filepath: string): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    // all page
    const md = parser.parse(filepath);
    const parsedAll = MakeHTML.make(md.html || "");
    const htmlFilename = filepath.replace(extFilter, "html");
    fs.writeFileSync(htmlFilename, parsedAll);
    filesList[filesList.length] = htmlFilename;

    // splitted Pages
    const vals = await parser.readTarget(filepath, "##");
    vals.forEach((elem, idx) => {
      // splitted file
      const path = `${filepath.replace("." + extFilter, "")}.${idx}.html`;
      // convert to html.
      const parsed = MakeHTML.make(parser.parseStr(elem));
      fs.writeFileSync(path, parsed);

      filesList[filesList.length] = path;
    });
    resolve();
  });
};

async function seekDir(dirpath: string): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    const list = fs.readdirSync(dirpath);
    if (list !== undefined) {
      for (let value of list.filter(extension)) {
        console.log(dirpath + "/" + value);
        await parse(path.resolve(dirpath, value));
      }
      // Loop of Directory.
      for (let value of list) {
        if (excludeDirectories.indexOf(value) < 0) {
          let nextDir: string = dirpath + "/" + value;
          if (fs.statSync(nextDir).isDirectory()) {
            await seekDir(nextDir);
          }
        }
      }
    }
    resolve();
  });
}

function createIndex() {
  console.log("made files are " + filesList.length);
  console.log(filesList);
  fs.writeFileSync(
    "./index.html",
    MakeIndex.make(filesList, "contents.", process.cwd() + "/")
  );
}

seekDir(seekBaseDir).then(() => createIndex());
