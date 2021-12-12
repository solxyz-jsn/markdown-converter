import fs from "fs";
import marked, { Renderer } from "marked";
import highlightjs from "highlight.js";
import readline from "readline";

const renderer = new marked.Renderer();
renderer.code = function (
  code: string,
  fileInfo: string | undefined,
  escaped: boolean
): string {
  const delimiter = ":";
  const info = (fileInfo || "").split(delimiter);
  const lang = info.shift();
  const fileName = info.join(delimiter); // 2つ目以降のdelimiterはファイル名として扱う
  let fileTag = "";

  if (fileName) {
    fileTag = '<code class="filename">' + fileName + "</code>";
  }

  if (renderer.options.highlight) {
    const out = renderer.options.highlight(code, lang || "");
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return `<pre>${fileTag}<code>${code}</code></pre>`;
  }

  return `<pre>${fileTag}<code class="${
    renderer.options.langPrefix || ""
  }${escape(lang)}">${code}</code></pre>`;
};

marked.setOptions({
  highlight: function (code, lang) {
    return highlightjs.highlightAuto(code, [lang.split(":")[0]]).value;
  }, // シンタックスハイライトに使用する関数の設定
  pedantic: false, // trueの場合はmarkdown.plに準拠する gfmを使用する場合はfalseで大丈夫
  gfm: true, // GitHub Flavored Markdownを使用
  breaks: true, // falseにすると改行入力は末尾の半角スペース2つになる
  // sanitize: true,  // trueにすると特殊文字をエスケープする
  silent: false, // trueにするとパースに失敗してもExceptionを投げなくなる
  renderer: renderer,
});

/**
 * Markdownパーサ
 */
export default class MarkdownParser {
  constructor() {}

  /**
   * 対象のページで分割して取得
   * @param path ファイルパス
   * @param target 分割対象のタグ(## や ### を指定)
   * @returns Markdown要素
   */
  readTarget(path: string, target: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const parsed: string[] = [];

      try {
        const file = fs.createReadStream(path);

        const reader = readline.createInterface({ input: file });
        let retStr = "";

        // Reading with each lines
        let i = 0;
        reader.on("line", (data) => {
          // console.log(data);
          const regex = new RegExp(`^${target} .*`);
          const match = data.match(regex);
          if (match) {
            // console.log('match');
            parsed[i] = retStr;
            i = i + 1;
            retStr = "";
          }
          // if (i === place) {
          retStr += data + "\n";
          // }
        });
        reader.on("close", () => {
          parsed[i] = retStr;
          resolve(parsed);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Markdown to HTML
   * @param doc Markdownドキュメント
   * @returns HTML
   */
  parseStr(doc: string): string {
    return marked.parse(doc);
  }

  /**
   * ファイルを読み込みHTMLへパース
   * @param path ファイルパス
   * @returns HTML
   */
  parse(path: string): { html: string | null; err: any } {
    try {
      const file = fs.readFileSync(path);
      if (!file) {
        return { html: null, err: "File Reading Error." };
      }

      const parsed = marked.parse(file.toString());

      return { html: parsed, err: null };
    } catch (e) {
      return { html: null, err: e };
    }
  }
}
