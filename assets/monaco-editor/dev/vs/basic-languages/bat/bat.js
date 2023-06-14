/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.32.1(29a273516805a852aa8edc5e05059f119b13eff0)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/
define("vs/basic-languages/bat/bat", ["require"],(require)=>{
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

  // src/basic-languages/bat/bat.ts
  var bat_exports = {};
  __export(bat_exports, {
    conf: () => conf,
    language: () => language
  });
  var conf = {
    comments: {
      lineComment: "REM"
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"]
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' }
    ],
    surroundingPairs: [
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' }
    ],
    folding: {
      markers: {
        start: new RegExp("^\\s*(::\\s*|REM\\s+)#region"),
        end: new RegExp("^\\s*(::\\s*|REM\\s+)#endregion")
      }
    }
  };
  var language = {
    defaultToken: "",
    ignoreCase: true,
    tokenPostfix: ".bat",
    brackets: [
      { token: "delimiter.bracket", open: "{", close: "}" },
      { token: "delimiter.parenthesis", open: "(", close: ")" },
      { token: "delimiter.square", open: "[", close: "]" }
    ],
    keywords: /call|defined|echo|errorlevel|exist|for|goto|if|pause|set|shift|start|title|not|pushd|popd/,
    symbols: /[=><!~?&|+\-*\/\^;\.,]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    tokenizer: {
      root: [
        [/^(\s*)(rem(?:\s.*|))$/, ["", "comment"]],
        [/(\@?)(@keywords)(?!\w)/, [{ token: "keyword" }, { token: "keyword.$2" }]],
        [/[ \t\r\n]+/, ""],
        [/setlocal(?!\w)/, "keyword.tag-setlocal"],
        [/endlocal(?!\w)/, "keyword.tag-setlocal"],
        [/[a-zA-Z_]\w*/, ""],
        [/:\w*/, "metatag"],
        [/%[^%]+%/, "variable"],
        [/%%[\w]+(?!\w)/, "variable"],
        [/[{}()\[\]]/, "@brackets"],
        [/@symbols/, "delimiter"],
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F_]*[0-9a-fA-F]/, "number.hex"],
        [/\d+/, "number"],
        [/[;,.]/, "delimiter"],
        [/"/, "string", '@string."'],
        [/'/, "string", "@string.'"]
      ],
      string: [
        [
          /[^\\"'%]+/,
          {
            cases: {
              "@eos": { token: "string", next: "@popall" },
              "@default": "string"
            }
          }
        ],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/%[\w ]+%/, "variable"],
        [/%%[\w]+(?!\w)/, "variable"],
        [
          /["']/,
          {
            cases: {
              "$#==$S2": { token: "string", next: "@pop" },
              "@default": "string"
            }
          }
        ],
        [/$/, "string", "@popall"]
      ]
    }
  };
  return __toCommonJS(bat_exports);
})();
return moduleExports;
});
