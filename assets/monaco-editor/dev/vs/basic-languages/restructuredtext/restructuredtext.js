/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.32.1(29a273516805a852aa8edc5e05059f119b13eff0)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/
define("vs/basic-languages/restructuredtext/restructuredtext", ["require"],(require)=>{
var moduleExports = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toCommonJS = /* @__PURE__ */ ((cache) => {
    return (module, temp) => {
      return cache && cache.get(module) || (temp = __reExport(__markAsModule({}), module, 1), cache && cache.set(module, temp), temp);
    };
  })(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

  // src/basic-languages/restructuredtext/restructuredtext.ts
  var restructuredtext_exports = {};
  __export(restructuredtext_exports, {
    conf: () => conf,
    language: () => language
  });
  var conf = {
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"]
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "<", close: ">", notIn: ["string"] }
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "`", close: "`" }
    ],
    folding: {
      markers: {
        start: new RegExp("^\\s*<!--\\s*#?region\\b.*-->"),
        end: new RegExp("^\\s*<!--\\s*#?endregion\\b.*-->")
      }
    }
  };
  var language = {
    defaultToken: "",
    tokenPostfix: ".rst",
    control: /[\\`*_\[\]{}()#+\-\.!]/,
    escapes: /\\(?:@control)/,
    empty: [
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "link",
      "meta",
      "param"
    ],
    alphanumerics: /[A-Za-z0-9]/,
    simpleRefNameWithoutBq: /(?:@alphanumerics[-_+:.]*@alphanumerics)+|(?:@alphanumerics+)/,
    simpleRefName: /(?:`@phrase`|@simpleRefNameWithoutBq)/,
    phrase: /@simpleRefNameWithoutBq(?:\s@simpleRefNameWithoutBq)*/,
    citationName: /[A-Za-z][A-Za-z0-9-_.]*/,
    blockLiteralStart: /(?:[!"#$%&'()*+,-./:;<=>?@\[\]^_`{|}~]|[\s])/,
    precedingChars: /(?:[ -:/'"<([{])/,
    followingChars: /(?:[ -.,:;!?/'")\]}>]|$)/,
    punctuation: /(=|-|~|`|#|"|\^|\+|\*|:|\.|'|_|\+)/,
    tokenizer: {
      root: [
        [/^(@punctuation{3,}$){1,1}?/, "keyword"],
        [/^\s*([\*\-+‣•]|[a-zA-Z0-9]+\.|\([a-zA-Z0-9]+\)|[a-zA-Z0-9]+\))\s/, "keyword"],
        [/([ ]::)\s*$/, "keyword", "@blankLineOfLiteralBlocks"],
        [/(::)\s*$/, "keyword", "@blankLineOfLiteralBlocks"],
        { include: "@tables" },
        { include: "@explicitMarkupBlocks" },
        { include: "@inlineMarkup" }
      ],
      explicitMarkupBlocks: [
        { include: "@citations" },
        { include: "@footnotes" },
        [
          /^(\.\.\s)(@simpleRefName)(::\s)(.*)$/,
          [{ token: "", next: "subsequentLines" }, "keyword", "", ""]
        ],
        [
          /^(\.\.)(\s+)(_)(@simpleRefName)(:)(\s+)(.*)/,
          [{ token: "", next: "hyperlinks" }, "", "", "string.link", "", "", "string.link"]
        ],
        [
          /^((?:(?:\.\.)(?:\s+))?)(__)(:)(\s+)(.*)/,
          [{ token: "", next: "subsequentLines" }, "", "", "", "string.link"]
        ],
        [/^(__\s+)(.+)/, ["", "string.link"]],
        [
          /^(\.\.)( \|)([^| ]+[^|]*[^| ]*)(\| )(@simpleRefName)(:: .*)/,
          [{ token: "", next: "subsequentLines" }, "", "string.link", "", "keyword", ""],
          "@rawBlocks"
        ],
        [/(\|)([^| ]+[^|]*[^| ]*)(\|_{0,2})/, ["", "string.link", ""]],
        [/^(\.\.)([ ].*)$/, [{ token: "", next: "@comments" }, "comment"]]
      ],
      inlineMarkup: [
        { include: "@citationsReference" },
        { include: "@footnotesReference" },
        [/(@simpleRefName)(_{1,2})/, ["string.link", ""]],
        [/(`)([^<`]+\s+)(<)(.*)(>)(`)(_)/, ["", "string.link", "", "string.link", "", "", ""]],
        [/\*\*([^\\*]|\*(?!\*))+\*\*/, "strong"],
        [/\*[^*]+\*/, "emphasis"],
        [/(``)((?:[^`]|\`(?!`))+)(``)/, ["", "keyword", ""]],
        [/(__\s+)(.+)/, ["", "keyword"]],
        [/(:)((?:@simpleRefNameWithoutBq)?)(:`)([^`]+)(`)/, ["", "keyword", "", "", ""]],
        [/(`)([^`]+)(`:)((?:@simpleRefNameWithoutBq)?)(:)/, ["", "", "", "keyword", ""]],
        [/(`)([^`]+)(`)/, ""],
        [/(_`)(@phrase)(`)/, ["", "string.link", ""]]
      ],
      citations: [
        [
          /^(\.\.\s+\[)((?:@citationName))(\]\s+)(.*)/,
          [{ token: "", next: "@subsequentLines" }, "string.link", "", ""]
        ]
      ],
      citationsReference: [[/(\[)(@citationName)(\]_)/, ["", "string.link", ""]]],
      footnotes: [
        [
          /^(\.\.\s+\[)((?:[0-9]+))(\]\s+.*)/,
          [{ token: "", next: "@subsequentLines" }, "string.link", ""]
        ],
        [
          /^(\.\.\s+\[)((?:#@simpleRefName?))(\]\s+)(.*)/,
          [{ token: "", next: "@subsequentLines" }, "string.link", "", ""]
        ],
        [
          /^(\.\.\s+\[)((?:\*))(\]\s+)(.*)/,
          [{ token: "", next: "@subsequentLines" }, "string.link", "", ""]
        ]
      ],
      footnotesReference: [
        [/(\[)([0-9]+)(\])(_)/, ["", "string.link", "", ""]],
        [/(\[)(#@simpleRefName?)(\])(_)/, ["", "string.link", "", ""]],
        [/(\[)(\*)(\])(_)/, ["", "string.link", "", ""]]
      ],
      blankLineOfLiteralBlocks: [
        [/^$/, "", "@subsequentLinesOfLiteralBlocks"],
        [/^.*$/, "", "@pop"]
      ],
      subsequentLinesOfLiteralBlocks: [
        [/(@blockLiteralStart+)(.*)/, ["keyword", ""]],
        [/^(?!blockLiteralStart)/, "", "@popall"]
      ],
      subsequentLines: [
        [/^[\s]+.*/, ""],
        [/^(?!\s)/, "", "@pop"]
      ],
      hyperlinks: [
        [/^[\s]+.*/, "string.link"],
        [/^(?!\s)/, "", "@pop"]
      ],
      comments: [
        [/^[\s]+.*/, "comment"],
        [/^(?!\s)/, "", "@pop"]
      ],
      tables: [
        [/\+-[+-]+/, "keyword"],
        [/\+=[+=]+/, "keyword"]
      ]
    }
  };
  return __toCommonJS(restructuredtext_exports);
})();
return moduleExports;
});
