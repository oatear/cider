/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as browser from '../../../base/browser/browser.js';
import { FastDomNode } from '../../../base/browser/fastDomNode.js';
import { EDITOR_FONT_DEFAULTS } from '../../common/config/editorOptions.js';
export function applyFontInfo(domNode, fontInfo) {
    if (domNode instanceof FastDomNode) {
        domNode.setFontFamily(fontInfo.getMassagedFontFamily(browser.isSafari ? EDITOR_FONT_DEFAULTS.fontFamily : null));
        domNode.setFontWeight(fontInfo.fontWeight);
        domNode.setFontSize(fontInfo.fontSize);
        domNode.setFontFeatureSettings(fontInfo.fontFeatureSettings);
        domNode.setLineHeight(fontInfo.lineHeight);
        domNode.setLetterSpacing(fontInfo.letterSpacing);
    }
    else {
        domNode.style.fontFamily = fontInfo.getMassagedFontFamily(browser.isSafari ? EDITOR_FONT_DEFAULTS.fontFamily : null);
        domNode.style.fontWeight = fontInfo.fontWeight;
        domNode.style.fontSize = fontInfo.fontSize + 'px';
        domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
        domNode.style.lineHeight = fontInfo.lineHeight + 'px';
        domNode.style.letterSpacing = fontInfo.letterSpacing + 'px';
    }
}
