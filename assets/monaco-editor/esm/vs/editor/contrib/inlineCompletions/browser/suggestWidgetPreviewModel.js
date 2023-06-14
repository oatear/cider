/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createCancelablePromise, RunOnceScheduler } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { InlineCompletionTriggerKind } from '../../../common/languages.js';
import { BaseGhostTextWidgetModel, GhostText } from './ghostText.js';
import { minimizeInlineCompletion, provideInlineCompletions, UpdateOperation } from './inlineCompletionsModel.js';
import { inlineCompletionToGhostText } from './inlineCompletionToGhostText.js';
import { SuggestWidgetInlineCompletionProvider } from './suggestWidgetInlineCompletionProvider.js';
export class SuggestWidgetPreviewModel extends BaseGhostTextWidgetModel {
    constructor(editor, cache) {
        super(editor);
        this.cache = cache;
        this.suggestionInlineCompletionSource = this._register(new SuggestWidgetInlineCompletionProvider(this.editor, 
        // Use the first cache item (if any) as preselection.
        () => { var _a, _b; return (_b = (_a = this.cache.value) === null || _a === void 0 ? void 0 : _a.completions[0]) === null || _b === void 0 ? void 0 : _b.toLiveInlineCompletion(); }));
        this.updateOperation = this._register(new MutableDisposable());
        this.updateCacheSoon = this._register(new RunOnceScheduler(() => this.updateCache(), 50));
        this.minReservedLineCount = 0;
        this._register(this.suggestionInlineCompletionSource.onDidChange(() => {
            this.updateCacheSoon.schedule();
            const suggestWidgetState = this.suggestionInlineCompletionSource.state;
            if (!suggestWidgetState) {
                this.minReservedLineCount = 0;
            }
            const newGhostText = this.ghostText;
            if (newGhostText) {
                this.minReservedLineCount = Math.max(this.minReservedLineCount, sum(newGhostText.parts.map(p => p.lines.length - 1)));
            }
            if (this.minReservedLineCount >= 1) {
                this.suggestionInlineCompletionSource.forceRenderingAbove();
            }
            else {
                this.suggestionInlineCompletionSource.stopForceRenderingAbove();
            }
            this.onDidChangeEmitter.fire();
        }));
        this._register(this.cache.onDidChange(() => {
            this.onDidChangeEmitter.fire();
        }));
        this._register(this.editor.onDidChangeCursorPosition((e) => {
            this.minReservedLineCount = 0;
            this.updateCacheSoon.schedule();
            this.onDidChangeEmitter.fire();
        }));
        this._register(toDisposable(() => this.suggestionInlineCompletionSource.stopForceRenderingAbove()));
    }
    get isActive() {
        return this.suggestionInlineCompletionSource.state !== undefined;
    }
    isSuggestionPreviewEnabled() {
        const suggestOptions = this.editor.getOption(106 /* suggest */);
        return suggestOptions.preview;
    }
    updateCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const state = this.suggestionInlineCompletionSource.state;
            if (!state || !state.selectedItem) {
                return;
            }
            const info = {
                text: state.selectedItem.normalizedInlineCompletion.text,
                range: state.selectedItem.normalizedInlineCompletion.range,
                isSnippetText: state.selectedItem.isSnippetText,
                completionKind: state.selectedItem.completionItemKind,
            };
            const position = this.editor.getPosition();
            const promise = createCancelablePromise((token) => __awaiter(this, void 0, void 0, function* () {
                let result;
                try {
                    result = yield provideInlineCompletions(position, this.editor.getModel(), { triggerKind: InlineCompletionTriggerKind.Automatic, selectedSuggestionInfo: info }, token);
                }
                catch (e) {
                    onUnexpectedError(e);
                    return;
                }
                if (token.isCancellationRequested) {
                    return;
                }
                this.cache.setValue(this.editor, result, InlineCompletionTriggerKind.Automatic);
                this.onDidChangeEmitter.fire();
            }));
            const operation = new UpdateOperation(promise, InlineCompletionTriggerKind.Automatic);
            this.updateOperation.value = operation;
            yield promise;
            if (this.updateOperation.value === operation) {
                this.updateOperation.clear();
            }
        });
    }
    get ghostText() {
        var _a, _b, _c;
        const isSuggestionPreviewEnabled = this.isSuggestionPreviewEnabled();
        const augmentedCompletion = minimizeInlineCompletion(this.editor.getModel(), (_b = (_a = this.cache.value) === null || _a === void 0 ? void 0 : _a.completions[0]) === null || _b === void 0 ? void 0 : _b.toLiveInlineCompletion());
        const suggestWidgetState = this.suggestionInlineCompletionSource.state;
        const suggestInlineCompletion = minimizeInlineCompletion(this.editor.getModel(), (_c = suggestWidgetState === null || suggestWidgetState === void 0 ? void 0 : suggestWidgetState.selectedItem) === null || _c === void 0 ? void 0 : _c.normalizedInlineCompletion);
        const isAugmentedCompletionValid = augmentedCompletion
            && suggestInlineCompletion
            && augmentedCompletion.text.startsWith(suggestInlineCompletion.text)
            && augmentedCompletion.range.equalsRange(suggestInlineCompletion.range);
        if (!isSuggestionPreviewEnabled && !isAugmentedCompletionValid) {
            return undefined;
        }
        // If the augmented completion is not valid and there is no suggest inline completion, we still show the augmented completion.
        const finalCompletion = isAugmentedCompletionValid ? augmentedCompletion : (suggestInlineCompletion || augmentedCompletion);
        const inlineCompletionPreviewLength = isAugmentedCompletionValid ? finalCompletion.text.length - suggestInlineCompletion.text.length : 0;
        const newGhostText = this.toGhostText(finalCompletion, inlineCompletionPreviewLength);
        return newGhostText;
    }
    toGhostText(completion, inlineCompletionPreviewLength) {
        const mode = this.editor.getOptions().get(106 /* suggest */).previewMode;
        return completion
            ? (inlineCompletionToGhostText(completion, this.editor.getModel(), mode, this.editor.getPosition(), inlineCompletionPreviewLength) ||
                // Show an invisible ghost text to reserve space
                new GhostText(completion.range.endLineNumber, [], this.minReservedLineCount))
            : undefined;
    }
}
function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
