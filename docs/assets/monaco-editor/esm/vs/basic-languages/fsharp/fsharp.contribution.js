/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.32.1(29a273516805a852aa8edc5e05059f119b13eff0)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/

// src/basic-languages/fsharp/fsharp.contribution.ts
import { registerLanguage } from "../_.contribution.js";
registerLanguage({
  id: "fsharp",
  extensions: [".fs", ".fsi", ".ml", ".mli", ".fsx", ".fsscript"],
  aliases: ["F#", "FSharp", "fsharp"],
  loader: () => {
    if (false) {
      return new Promise((resolve, reject) => {
        __require(["vs/basic-languages/fsharp/fsharp"], resolve, reject);
      });
    } else {
      return import("./fsharp.js");
    }
  }
});
