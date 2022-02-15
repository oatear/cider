/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.32.1(29a273516805a852aa8edc5e05059f119b13eff0)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/

// src/basic-languages/razor/razor.contribution.ts
import { registerLanguage } from "../_.contribution.js";
registerLanguage({
  id: "razor",
  extensions: [".cshtml"],
  aliases: ["Razor", "razor"],
  mimetypes: ["text/x-cshtml"],
  loader: () => {
    if (false) {
      return new Promise((resolve, reject) => {
        __require(["vs/basic-languages/razor/razor"], resolve, reject);
      });
    } else {
      return import("./razor.js");
    }
  }
});
