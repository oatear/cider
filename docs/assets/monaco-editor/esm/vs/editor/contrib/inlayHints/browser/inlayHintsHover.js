/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { AsyncIterableObject } from '../../../../base/common/async.js';
import { isEmptyMarkdownString, MarkdownString } from '../../../../base/common/htmlContent.js';
import { Position } from '../../../common/core/position.js';
import { HoverProviderRegistry } from '../../../common/languages.js';
import { ModelDecorationInjectedTextOptions } from '../../../common/model/textModel.js';
import { HoverForeignElementAnchor } from '../../hover/browser/hoverTypes.js';
import { ILanguageService } from '../../../common/services/language.js';
import { ITextModelService } from '../../../common/services/resolverService.js';
import { getHover } from '../../hover/browser/getHover.js';
import { MarkdownHover, MarkdownHoverParticipant } from '../../hover/browser/markdownHoverParticipant.js';
import { RenderedInlayHintLabelPart, InlayHintsController } from './inlayHintsController.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
class InlayHintsHoverAnchor extends HoverForeignElementAnchor {
    constructor(part, owner) {
        super(10, owner, part.item.anchor.range);
        this.part = part;
    }
}
let InlayHintsHover = class InlayHintsHover extends MarkdownHoverParticipant {
    constructor(editor, languageService, openerService, configurationService, _resolverService) {
        super(editor, languageService, openerService, configurationService);
        this._resolverService = _resolverService;
    }
    suggestHoverAnchor(mouseEvent) {
        var _a;
        const controller = InlayHintsController.get(this._editor);
        if (!controller) {
            return null;
        }
        if (mouseEvent.target.type !== 6 /* CONTENT_TEXT */) {
            return null;
        }
        const options = (_a = mouseEvent.target.detail.injectedText) === null || _a === void 0 ? void 0 : _a.options;
        if (!(options instanceof ModelDecorationInjectedTextOptions && options.attachedData instanceof RenderedInlayHintLabelPart)) {
            return null;
        }
        return new InlayHintsHoverAnchor(options.attachedData, this);
    }
    computeSync() {
        return [];
    }
    computeAsync(anchor, _lineDecorations, token) {
        if (!(anchor instanceof InlayHintsHoverAnchor)) {
            return AsyncIterableObject.EMPTY;
        }
        return new AsyncIterableObject((executor) => __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            const { part } = anchor;
            yield part.item.resolve(token);
            if (token.isCancellationRequested) {
                return;
            }
            // (1) Inlay Tooltip
            let itemTooltip;
            if (typeof part.item.hint.tooltip === 'string') {
                itemTooltip = new MarkdownString().appendText(part.item.hint.tooltip);
            }
            else if (part.item.hint.tooltip) {
                itemTooltip = part.item.hint.tooltip;
            }
            if (itemTooltip) {
                executor.emitOne(new MarkdownHover(this, anchor.range, [itemTooltip], 0));
            }
            // (2) Inlay Label Part Tooltip
            let partTooltip;
            if (typeof part.part.tooltip === 'string') {
                partTooltip = new MarkdownString().appendText(part.part.tooltip);
            }
            else if (part.part.tooltip) {
                partTooltip = part.part.tooltip;
            }
            if (partTooltip) {
                executor.emitOne(new MarkdownHover(this, anchor.range, [partTooltip], 1));
            }
            // (3) Inlay Label Part Location tooltip
            const iterable = yield this._resolveInlayHintLabelPartHover(part, token);
            try {
                for (var iterable_1 = __asyncValues(iterable), iterable_1_1; iterable_1_1 = yield iterable_1.next(), !iterable_1_1.done;) {
                    let item = iterable_1_1.value;
                    executor.emitOne(item);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) yield _a.call(iterable_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }));
    }
    _resolveInlayHintLabelPartHover(part, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!part.part.location) {
                return AsyncIterableObject.EMPTY;
            }
            const { uri, range } = part.part.location;
            const ref = yield this._resolverService.createModelReference(uri);
            try {
                const model = ref.object.textEditorModel;
                if (!HoverProviderRegistry.has(model)) {
                    return AsyncIterableObject.EMPTY;
                }
                return getHover(model, new Position(range.startLineNumber, range.startColumn), token)
                    .filter(item => !isEmptyMarkdownString(item.hover.contents))
                    .map(item => new MarkdownHover(this, part.item.anchor.range, item.hover.contents, 2 + item.ordinal));
            }
            finally {
                ref.dispose();
            }
        });
    }
};
InlayHintsHover = __decorate([
    __param(1, ILanguageService),
    __param(2, IOpenerService),
    __param(3, IConfigurationService),
    __param(4, ITextModelService)
], InlayHintsHover);
export { InlayHintsHover };
