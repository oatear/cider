/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.39.0(ff3621a3fa6389873be5412d17554294ea1b0941)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/

// src/basic-languages/csharp/csharp.contribution.ts
import { registerLanguage } from "../_.contribution.js";
registerLanguage({
  id: "csharp",
  extensions: [".cs", ".csx", ".cake"],
  aliases: ["C#", "csharp"],
  loader: () => {
    if (false) {
      return new Promise((resolve, reject) => {
        __require(["vs/basic-languages/csharp/csharp"], resolve, reject);
      });
    } else {
      return import("./csharp.js");
    }
  }
});
