/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './textAreaHandler.css';
import * as nls from '../../../nls.js';
import * as browser from '../../../base/browser/browser.js';
import { createFastDomNode } from '../../../base/browser/fastDomNode.js';
import * as platform from '../../../base/common/platform.js';
import * as strings from '../../../base/common/strings.js';
import { applyFontInfo } from '../config/domFontInfo.js';
import { CopyOptions, TextAreaInput, TextAreaWrapper } from './textAreaInput.js';
import { PagedScreenReaderStrategy, TextAreaState, _debugComposition } from './textAreaState.js';
import { PartFingerprints, ViewPart } from '../view/viewPart.js';
import { LineNumbersOverlay } from '../viewParts/lineNumbers/lineNumbers.js';
import { Margin } from '../viewParts/margin/margin.js';
import { EditorOptions } from '../../common/config/editorOptions.js';
import { getMapForWordSeparators } from '../../common/core/wordCharacterClassifier.js';
import { Position } from '../../common/core/position.js';
import { Range } from '../../common/core/range.js';
import { Selection } from '../../common/core/selection.js';
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from '../../../base/browser/ui/mouseCursor/mouseCursor.js';
import { TokenizationRegistry } from '../../common/languages.js';
import { Color } from '../../../base/common/color.js';
class VisibleTextAreaData {
    constructor(_context, modelLineNumber, distanceToModelLineStart, widthOfHiddenLineTextBefore, distanceToModelLineEnd) {
        this._context = _context;
        this.modelLineNumber = modelLineNumber;
        this.distanceToModelLineStart = distanceToModelLineStart;
        this.widthOfHiddenLineTextBefore = widthOfHiddenLineTextBefore;
        this.distanceToModelLineEnd = distanceToModelLineEnd;
        this._visibleTextAreaBrand = undefined;
        this.startPosition = null;
        this.endPosition = null;
        this.visibleTextareaStart = null;
        this.visibleTextareaEnd = null;
    }
    prepareRender(visibleRangeProvider) {
        const startModelPosition = new Position(this.modelLineNumber, this.distanceToModelLineStart + 1);
        const endModelPosition = new Position(this.modelLineNumber, this._context.model.getModelLineMaxColumn(this.modelLineNumber) - this.distanceToModelLineEnd);
        this.startPosition = this._context.model.coordinatesConverter.convertModelPositionToViewPosition(startModelPosition);
        this.endPosition = this._context.model.coordinatesConverter.convertModelPositionToViewPosition(endModelPosition);
        if (this.startPosition.lineNumber === this.endPosition.lineNumber) {
            this.visibleTextareaStart = visibleRangeProvider.visibleRangeForPosition(this.startPosition);
            this.visibleTextareaEnd = visibleRangeProvider.visibleRangeForPosition(this.endPosition);
        }
        else {
            // TODO: what if the view positions are not on the same line?
            this.visibleTextareaStart = null;
            this.visibleTextareaEnd = null;
        }
    }
}
const canUseZeroSizeTextarea = (browser.isFirefox);
export class TextAreaHandler extends ViewPart {
    constructor(context, viewController, visibleRangeProvider) {
        super(context);
        // --- end view API
        this._primaryCursorPosition = new Position(1, 1);
        this._primaryCursorVisibleRange = null;
        this._viewController = viewController;
        this._visibleRangeProvider = visibleRangeProvider;
        this._scrollLeft = 0;
        this._scrollTop = 0;
        const options = this._context.configuration.options;
        const layoutInfo = options.get(131 /* layoutInfo */);
        this._setAccessibilityOptions(options);
        this._contentLeft = layoutInfo.contentLeft;
        this._contentWidth = layoutInfo.contentWidth;
        this._contentHeight = layoutInfo.height;
        this._fontInfo = options.get(44 /* fontInfo */);
        this._lineHeight = options.get(59 /* lineHeight */);
        this._emptySelectionClipboard = options.get(32 /* emptySelectionClipboard */);
        this._copyWithSyntaxHighlighting = options.get(21 /* copyWithSyntaxHighlighting */);
        this._visibleTextArea = null;
        this._selections = [new Selection(1, 1, 1, 1)];
        this._modelSelections = [new Selection(1, 1, 1, 1)];
        this._lastRenderPosition = null;
        // Text Area (The focus will always be in the textarea when the cursor is blinking)
        this.textArea = createFastDomNode(document.createElement('textarea'));
        PartFingerprints.write(this.textArea, 6 /* TextArea */);
        this.textArea.setClassName(`inputarea ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
        this.textArea.setAttribute('wrap', 'off');
        this.textArea.setAttribute('autocorrect', 'off');
        this.textArea.setAttribute('autocapitalize', 'off');
        this.textArea.setAttribute('autocomplete', 'off');
        this.textArea.setAttribute('spellcheck', 'false');
        this.textArea.setAttribute('aria-label', this._getAriaLabel(options));
        this.textArea.setAttribute('tabindex', String(options.get(112 /* tabIndex */)));
        this.textArea.setAttribute('role', 'textbox');
        this.textArea.setAttribute('aria-roledescription', nls.localize('editor', "editor"));
        this.textArea.setAttribute('aria-multiline', 'true');
        this.textArea.setAttribute('aria-haspopup', 'false');
        this.textArea.setAttribute('aria-autocomplete', 'both');
        if (options.get(30 /* domReadOnly */) && options.get(81 /* readOnly */)) {
            this.textArea.setAttribute('readonly', 'true');
        }
        this.textAreaCover = createFastDomNode(document.createElement('div'));
        this.textAreaCover.setPosition('absolute');
        const simpleModel = {
            getLineCount: () => {
                return this._context.model.getLineCount();
            },
            getLineMaxColumn: (lineNumber) => {
                return this._context.model.getLineMaxColumn(lineNumber);
            },
            getValueInRange: (range, eol) => {
                return this._context.model.getValueInRange(range, eol);
            }
        };
        const textAreaInputHost = {
            getDataToCopy: () => {
                const rawTextToCopy = this._context.model.getPlainTextToCopy(this._modelSelections, this._emptySelectionClipboard, platform.isWindows);
                const newLineCharacter = this._context.model.getEOL();
                const isFromEmptySelection = (this._emptySelectionClipboard && this._modelSelections.length === 1 && this._modelSelections[0].isEmpty());
                const multicursorText = (Array.isArray(rawTextToCopy) ? rawTextToCopy : null);
                const text = (Array.isArray(rawTextToCopy) ? rawTextToCopy.join(newLineCharacter) : rawTextToCopy);
                let html = undefined;
                let mode = null;
                if (CopyOptions.forceCopyWithSyntaxHighlighting || (this._copyWithSyntaxHighlighting && text.length < 65536)) {
                    const richText = this._context.model.getRichTextToCopy(this._modelSelections, this._emptySelectionClipboard);
                    if (richText) {
                        html = richText.html;
                        mode = richText.mode;
                    }
                }
                return {
                    isFromEmptySelection,
                    multicursorText,
                    text,
                    html,
                    mode
                };
            },
            getScreenReaderContent: (currentState) => {
                if (this._accessibilitySupport === 1 /* Disabled */) {
                    // We know for a fact that a screen reader is not attached
                    // On OSX, we write the character before the cursor to allow for "long-press" composition
                    // Also on OSX, we write the word before the cursor to allow for the Accessibility Keyboard to give good hints
                    if (platform.isMacintosh) {
                        const selection = this._selections[0];
                        if (selection.isEmpty()) {
                            const position = selection.getStartPosition();
                            let textBefore = this._getWordBeforePosition(position);
                            if (textBefore.length === 0) {
                                textBefore = this._getCharacterBeforePosition(position);
                            }
                            if (textBefore.length > 0) {
                                return new TextAreaState(textBefore, textBefore.length, textBefore.length, position, position);
                            }
                        }
                    }
                    return TextAreaState.EMPTY;
                }
                if (browser.isAndroid) {
                    // when tapping in the editor on a word, Android enters composition mode.
                    // in the `compositionstart` event we cannot clear the textarea, because
                    // it then forgets to ever send a `compositionend`.
                    // we therefore only write the current word in the textarea
                    const selection = this._selections[0];
                    if (selection.isEmpty()) {
                        const position = selection.getStartPosition();
                        const [wordAtPosition, positionOffsetInWord] = this._getAndroidWordAtPosition(position);
                        if (wordAtPosition.length > 0) {
                            return new TextAreaState(wordAtPosition, positionOffsetInWord, positionOffsetInWord, position, position);
                        }
                    }
                    return TextAreaState.EMPTY;
                }
                return PagedScreenReaderStrategy.fromEditorSelection(currentState, simpleModel, this._selections[0], this._accessibilityPageSize, this._accessibilitySupport === 0 /* Unknown */);
            },
            deduceModelPosition: (viewAnchorPosition, deltaOffset, lineFeedCnt) => {
                return this._context.model.deduceModelPositionRelativeToViewPosition(viewAnchorPosition, deltaOffset, lineFeedCnt);
            }
        };
        const textAreaWrapper = this._register(new TextAreaWrapper(this.textArea.domNode));
        this._textAreaInput = this._register(new TextAreaInput(textAreaInputHost, textAreaWrapper, platform.OS, browser));
        this._register(this._textAreaInput.onKeyDown((e) => {
            this._viewController.emitKeyDown(e);
        }));
        this._register(this._textAreaInput.onKeyUp((e) => {
            this._viewController.emitKeyUp(e);
        }));
        this._register(this._textAreaInput.onPaste((e) => {
            let pasteOnNewLine = false;
            let multicursorText = null;
            let mode = null;
            if (e.metadata) {
                pasteOnNewLine = (this._emptySelectionClipboard && !!e.metadata.isFromEmptySelection);
                multicursorText = (typeof e.metadata.multicursorText !== 'undefined' ? e.metadata.multicursorText : null);
                mode = e.metadata.mode;
            }
            this._viewController.paste(e.text, pasteOnNewLine, multicursorText, mode);
        }));
        this._register(this._textAreaInput.onCut(() => {
            this._viewController.cut();
        }));
        this._register(this._textAreaInput.onType((e) => {
            if (e.replacePrevCharCnt || e.replaceNextCharCnt || e.positionDelta) {
                // must be handled through the new command
                if (_debugComposition) {
                    console.log(` => compositionType: <<${e.text}>>, ${e.replacePrevCharCnt}, ${e.replaceNextCharCnt}, ${e.positionDelta}`);
                }
                this._viewController.compositionType(e.text, e.replacePrevCharCnt, e.replaceNextCharCnt, e.positionDelta);
            }
            else {
                if (_debugComposition) {
                    console.log(` => type: <<${e.text}>>`);
                }
                this._viewController.type(e.text);
            }
        }));
        this._register(this._textAreaInput.onSelectionChangeRequest((modelSelection) => {
            this._viewController.setSelection(modelSelection);
        }));
        this._register(this._textAreaInput.onCompositionStart((e) => {
            // The textarea might contain some content when composition starts.
            //
            // When we make the textarea visible, it always has a height of 1 line,
            // so we don't need to worry too much about content on lines above or below
            // the selection.
            //
            // However, the text on the current line needs to be made visible because
            // some IME methods allow to glyphs on the current line (by pressing arrow keys).
            //
            // (1) The textarea might contain only some parts of the current line,
            // like the word before the selection. Also, the content inside the textarea
            // can grow or shrink as composition occurs. We therefore anchor the textarea
            // in terms of distance to a certain line start and line end.
            //
            // (2) Also, we should not make \t characters visible, because their rendering
            // inside the <textarea> will not align nicely with our rendering. We therefore
            // can hide some of the leading text on the current line.
            const ta = this.textArea.domNode;
            const modelSelection = this._modelSelections[0];
            const { distanceToModelLineStart, widthOfHiddenTextBefore } = (() => {
                // Find the text that is on the current line before the selection
                const textBeforeSelection = ta.value.substring(0, Math.min(ta.selectionStart, ta.selectionEnd));
                const lineFeedOffset1 = textBeforeSelection.lastIndexOf('\n');
                const lineTextBeforeSelection = textBeforeSelection.substring(lineFeedOffset1 + 1);
                // We now search to see if we should hide some part of it (if it contains \t)
                const tabOffset1 = lineTextBeforeSelection.lastIndexOf('\t');
                const desiredVisibleBeforeCharCount = lineTextBeforeSelection.length - tabOffset1 - 1;
                const startModelPosition = modelSelection.getStartPosition();
                const visibleBeforeCharCount = Math.min(startModelPosition.column - 1, desiredVisibleBeforeCharCount);
                const distanceToModelLineStart = startModelPosition.column - 1 - visibleBeforeCharCount;
                const hiddenLineTextBefore = lineTextBeforeSelection.substring(0, lineTextBeforeSelection.length - visibleBeforeCharCount);
                const widthOfHiddenTextBefore = measureText(hiddenLineTextBefore, this._fontInfo);
                return { distanceToModelLineStart, widthOfHiddenTextBefore };
            })();
            const { distanceToModelLineEnd } = (() => {
                // Find the text that is on the current line after the selection
                const textAfterSelection = ta.value.substring(Math.max(ta.selectionStart, ta.selectionEnd));
                const lineFeedOffset2 = textAfterSelection.indexOf('\n');
                const lineTextAfterSelection = lineFeedOffset2 === -1 ? textAfterSelection : textAfterSelection.substring(0, lineFeedOffset2);
                const tabOffset2 = lineTextAfterSelection.indexOf('\t');
                const desiredVisibleAfterCharCount = (tabOffset2 === -1 ? lineTextAfterSelection.length : lineTextAfterSelection.length - tabOffset2 - 1);
                const endModelPosition = modelSelection.getEndPosition();
                const visibleAfterCharCount = Math.min(this._context.model.getModelLineMaxColumn(endModelPosition.lineNumber) - endModelPosition.column, desiredVisibleAfterCharCount);
                const distanceToModelLineEnd = this._context.model.getModelLineMaxColumn(endModelPosition.lineNumber) - endModelPosition.column - visibleAfterCharCount;
                return { distanceToModelLineEnd };
            })();
            // Scroll to reveal the location in the editor
            this._context.model.revealRange('keyboard', true, Range.fromPositions(this._selections[0].getStartPosition()), 0 /* Simple */, 1 /* Immediate */);
            this._visibleTextArea = new VisibleTextAreaData(this._context, modelSelection.startLineNumber, distanceToModelLineStart, widthOfHiddenTextBefore, distanceToModelLineEnd);
            this._visibleTextArea.prepareRender(this._visibleRangeProvider);
            this._render();
            // Show the textarea
            this.textArea.setClassName(`inputarea ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME} ime-input`);
            this._viewController.compositionStart();
            this._context.model.onCompositionStart();
        }));
        this._register(this._textAreaInput.onCompositionUpdate((e) => {
            if (!this._visibleTextArea) {
                return;
            }
            this._visibleTextArea.prepareRender(this._visibleRangeProvider);
            this._render();
        }));
        this._register(this._textAreaInput.onCompositionEnd(() => {
            this._visibleTextArea = null;
            this._render();
            this.textArea.setClassName(`inputarea ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
            this._viewController.compositionEnd();
            this._context.model.onCompositionEnd();
        }));
        this._register(this._textAreaInput.onFocus(() => {
            this._context.model.setHasFocus(true);
        }));
        this._register(this._textAreaInput.onBlur(() => {
            this._context.model.setHasFocus(false);
        }));
    }
    dispose() {
        super.dispose();
    }
    _getAndroidWordAtPosition(position) {
        const ANDROID_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:",.<>/?';
        const lineContent = this._context.model.getLineContent(position.lineNumber);
        const wordSeparators = getMapForWordSeparators(ANDROID_WORD_SEPARATORS);
        let goingLeft = true;
        let startColumn = position.column;
        let goingRight = true;
        let endColumn = position.column;
        let distance = 0;
        while (distance < 50 && (goingLeft || goingRight)) {
            if (goingLeft && startColumn <= 1) {
                goingLeft = false;
            }
            if (goingLeft) {
                const charCode = lineContent.charCodeAt(startColumn - 2);
                const charClass = wordSeparators.get(charCode);
                if (charClass !== 0 /* Regular */) {
                    goingLeft = false;
                }
                else {
                    startColumn--;
                }
            }
            if (goingRight && endColumn > lineContent.length) {
                goingRight = false;
            }
            if (goingRight) {
                const charCode = lineContent.charCodeAt(endColumn - 1);
                const charClass = wordSeparators.get(charCode);
                if (charClass !== 0 /* Regular */) {
                    goingRight = false;
                }
                else {
                    endColumn++;
                }
            }
            distance++;
        }
        return [lineContent.substring(startColumn - 1, endColumn - 1), position.column - startColumn];
    }
    _getWordBeforePosition(position) {
        const lineContent = this._context.model.getLineContent(position.lineNumber);
        const wordSeparators = getMapForWordSeparators(this._context.configuration.options.get(117 /* wordSeparators */));
        let column = position.column;
        let distance = 0;
        while (column > 1) {
            const charCode = lineContent.charCodeAt(column - 2);
            const charClass = wordSeparators.get(charCode);
            if (charClass !== 0 /* Regular */ || distance > 50) {
                return lineContent.substring(column - 1, position.column - 1);
            }
            distance++;
            column--;
        }
        return lineContent.substring(0, position.column - 1);
    }
    _getCharacterBeforePosition(position) {
        if (position.column > 1) {
            const lineContent = this._context.model.getLineContent(position.lineNumber);
            const charBefore = lineContent.charAt(position.column - 2);
            if (!strings.isHighSurrogate(charBefore.charCodeAt(0))) {
                return charBefore;
            }
        }
        return '';
    }
    _getAriaLabel(options) {
        const accessibilitySupport = options.get(2 /* accessibilitySupport */);
        if (accessibilitySupport === 1 /* Disabled */) {
            return nls.localize('accessibilityOffAriaLabel', "The editor is not accessible at this time. Press {0} for options.", platform.isLinux ? 'Shift+Alt+F1' : 'Alt+F1');
        }
        return options.get(4 /* ariaLabel */);
    }
    _setAccessibilityOptions(options) {
        this._accessibilitySupport = options.get(2 /* accessibilitySupport */);
        const accessibilityPageSize = options.get(3 /* accessibilityPageSize */);
        if (this._accessibilitySupport === 2 /* Enabled */ && accessibilityPageSize === EditorOptions.accessibilityPageSize.defaultValue) {
            // If a screen reader is attached and the default value is not set we shuold automatically increase the page size to 500 for a better experience
            this._accessibilityPageSize = 500;
        }
        else {
            this._accessibilityPageSize = accessibilityPageSize;
        }
    }
    // --- begin event handlers
    onConfigurationChanged(e) {
        const options = this._context.configuration.options;
        const layoutInfo = options.get(131 /* layoutInfo */);
        this._setAccessibilityOptions(options);
        this._contentLeft = layoutInfo.contentLeft;
        this._contentWidth = layoutInfo.contentWidth;
        this._contentHeight = layoutInfo.height;
        this._fontInfo = options.get(44 /* fontInfo */);
        this._lineHeight = options.get(59 /* lineHeight */);
        this._emptySelectionClipboard = options.get(32 /* emptySelectionClipboard */);
        this._copyWithSyntaxHighlighting = options.get(21 /* copyWithSyntaxHighlighting */);
        this.textArea.setAttribute('aria-label', this._getAriaLabel(options));
        this.textArea.setAttribute('tabindex', String(options.get(112 /* tabIndex */)));
        if (e.hasChanged(30 /* domReadOnly */) || e.hasChanged(81 /* readOnly */)) {
            if (options.get(30 /* domReadOnly */) && options.get(81 /* readOnly */)) {
                this.textArea.setAttribute('readonly', 'true');
            }
            else {
                this.textArea.removeAttribute('readonly');
            }
        }
        if (e.hasChanged(2 /* accessibilitySupport */)) {
            this._textAreaInput.writeScreenReaderContent('strategy changed');
        }
        return true;
    }
    onCursorStateChanged(e) {
        this._selections = e.selections.slice(0);
        this._modelSelections = e.modelSelections.slice(0);
        this._textAreaInput.writeScreenReaderContent('selection changed');
        return true;
    }
    onDecorationsChanged(e) {
        // true for inline decorations that can end up relayouting text
        return true;
    }
    onFlushed(e) {
        return true;
    }
    onLinesChanged(e) {
        return true;
    }
    onLinesDeleted(e) {
        return true;
    }
    onLinesInserted(e) {
        return true;
    }
    onScrollChanged(e) {
        this._scrollLeft = e.scrollLeft;
        this._scrollTop = e.scrollTop;
        return true;
    }
    onZonesChanged(e) {
        return true;
    }
    // --- end event handlers
    // --- begin view API
    isFocused() {
        return this._textAreaInput.isFocused();
    }
    focusTextArea() {
        this._textAreaInput.focusTextArea();
    }
    getLastRenderData() {
        return this._lastRenderPosition;
    }
    setAriaOptions(options) {
        if (options.activeDescendant) {
            this.textArea.setAttribute('aria-haspopup', 'true');
            this.textArea.setAttribute('aria-autocomplete', 'list');
            this.textArea.setAttribute('aria-activedescendant', options.activeDescendant);
        }
        else {
            this.textArea.setAttribute('aria-haspopup', 'false');
            this.textArea.setAttribute('aria-autocomplete', 'both');
            this.textArea.removeAttribute('aria-activedescendant');
        }
        if (options.role) {
            this.textArea.setAttribute('role', options.role);
        }
    }
    prepareRender(ctx) {
        this._primaryCursorPosition = new Position(this._selections[0].positionLineNumber, this._selections[0].positionColumn);
        this._primaryCursorVisibleRange = ctx.visibleRangeForPosition(this._primaryCursorPosition);
        if (this._visibleTextArea) {
            this._visibleTextArea.prepareRender(ctx);
        }
    }
    render(ctx) {
        this._textAreaInput.writeScreenReaderContent('render');
        this._render();
    }
    _render() {
        if (this._visibleTextArea) {
            // The text area is visible for composition reasons
            const visibleStart = this._visibleTextArea.visibleTextareaStart;
            const visibleEnd = this._visibleTextArea.visibleTextareaEnd;
            const startPosition = this._visibleTextArea.startPosition;
            const endPosition = this._visibleTextArea.endPosition;
            if (startPosition && endPosition && visibleStart && visibleEnd && visibleEnd.left >= this._scrollLeft && visibleStart.left <= this._scrollLeft + this._contentWidth) {
                const top = (this._context.viewLayout.getVerticalOffsetForLineNumber(this._primaryCursorPosition.lineNumber) - this._scrollTop);
                const lineCount = this._newlinecount(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
                this.textArea.domNode.scrollTop = lineCount * this._lineHeight;
                let scrollLeft = this._visibleTextArea.widthOfHiddenLineTextBefore;
                let left = (this._contentLeft + visibleStart.left - this._scrollLeft);
                let width = visibleEnd.left - visibleStart.left;
                if (left < this._contentLeft) {
                    // the textarea would be rendered on top of the margin,
                    // so reduce its width. We use the same technique as
                    // for hiding text before
                    const delta = (this._contentLeft - left);
                    left += delta;
                    scrollLeft += delta;
                    width -= delta;
                }
                if (width > this._contentWidth) {
                    // the textarea would be wider than the content width,
                    // so reduce its width.
                    width = this._contentWidth;
                }
                this.textArea.domNode.scrollLeft = scrollLeft;
                this._renderInsideEditor(null, top, left, width, this._lineHeight);
                // Try to render the textarea with the color/font style to match the text under it
                const viewLineData = this._context.model.getViewLineData(startPosition.lineNumber);
                const startTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(startPosition.column - 1);
                const endTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(endPosition.column - 1);
                let presentation;
                if (startTokenIndex === endTokenIndex) {
                    presentation = viewLineData.tokens.getPresentation(startTokenIndex);
                }
                else {
                    // if the textarea spans multiple tokens, then use default styles
                    presentation = {
                        foreground: 1 /* DefaultForeground */,
                        italic: false,
                        bold: false,
                        underline: false,
                        strikethrough: false,
                    };
                }
                const color = (TokenizationRegistry.getColorMap() || [])[presentation.foreground];
                this.textArea.domNode.style.color = (color ? Color.Format.CSS.formatHex(color) : 'inherit');
                this.textArea.domNode.style.fontStyle = (presentation.italic ? 'italic' : 'inherit');
                if (presentation.bold) {
                    // fontWeight is also set by `applyFontInfo`, so only overwrite it if necessary
                    this.textArea.domNode.style.fontWeight = 'bold';
                }
                this.textArea.domNode.style.textDecoration = `${presentation.underline ? ' underline' : ''}${presentation.strikethrough ? ' line-through' : ''}`;
            }
            return;
        }
        if (!this._primaryCursorVisibleRange) {
            // The primary cursor is outside the viewport => place textarea to the top left
            this._renderAtTopLeft();
            return;
        }
        const left = this._contentLeft + this._primaryCursorVisibleRange.left - this._scrollLeft;
        if (left < this._contentLeft || left > this._contentLeft + this._contentWidth) {
            // cursor is outside the viewport
            this._renderAtTopLeft();
            return;
        }
        const top = this._context.viewLayout.getVerticalOffsetForLineNumber(this._selections[0].positionLineNumber) - this._scrollTop;
        if (top < 0 || top > this._contentHeight) {
            // cursor is outside the viewport
            this._renderAtTopLeft();
            return;
        }
        // The primary cursor is in the viewport (at least vertically) => place textarea on the cursor
        if (platform.isMacintosh) {
            // For the popup emoji input, we will make the text area as high as the line height
            // We will also make the fontSize and lineHeight the correct dimensions to help with the placement of these pickers
            this._renderInsideEditor(this._primaryCursorPosition, top, left, canUseZeroSizeTextarea ? 0 : 1, this._lineHeight);
            // In case the textarea contains a word, we're going to try to align the textarea's cursor
            // with our cursor by scrolling the textarea as much as possible
            this.textArea.domNode.scrollLeft = this._primaryCursorVisibleRange.left;
            const lineCount = this._newlinecount(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
            this.textArea.domNode.scrollTop = lineCount * this._lineHeight;
            return;
        }
        this._renderInsideEditor(this._primaryCursorPosition, top, left, canUseZeroSizeTextarea ? 0 : 1, canUseZeroSizeTextarea ? 0 : 1);
    }
    _newlinecount(text) {
        let result = 0;
        let startIndex = -1;
        do {
            startIndex = text.indexOf('\n', startIndex + 1);
            if (startIndex === -1) {
                break;
            }
            result++;
        } while (true);
        return result;
    }
    _renderInsideEditor(renderedPosition, top, left, width, height) {
        this._lastRenderPosition = renderedPosition;
        const ta = this.textArea;
        const tac = this.textAreaCover;
        applyFontInfo(ta, this._fontInfo);
        ta.setTop(top);
        ta.setLeft(left);
        ta.setWidth(width);
        ta.setHeight(height);
        tac.setTop(0);
        tac.setLeft(0);
        tac.setWidth(0);
        tac.setHeight(0);
    }
    _renderAtTopLeft() {
        this._lastRenderPosition = null;
        const ta = this.textArea;
        const tac = this.textAreaCover;
        applyFontInfo(ta, this._fontInfo);
        ta.setTop(0);
        ta.setLeft(0);
        tac.setTop(0);
        tac.setLeft(0);
        if (canUseZeroSizeTextarea) {
            ta.setWidth(0);
            ta.setHeight(0);
            tac.setWidth(0);
            tac.setHeight(0);
            return;
        }
        // (in WebKit the textarea is 1px by 1px because it cannot handle input to a 0x0 textarea)
        // specifically, when doing Korean IME, setting the textarea to 0x0 breaks IME badly.
        ta.setWidth(1);
        ta.setHeight(1);
        tac.setWidth(1);
        tac.setHeight(1);
        const options = this._context.configuration.options;
        if (options.get(50 /* glyphMargin */)) {
            tac.setClassName('monaco-editor-background textAreaCover ' + Margin.OUTER_CLASS_NAME);
        }
        else {
            if (options.get(60 /* lineNumbers */).renderType !== 0 /* Off */) {
                tac.setClassName('monaco-editor-background textAreaCover ' + LineNumbersOverlay.CLASS_NAME);
            }
            else {
                tac.setClassName('monaco-editor-background textAreaCover');
            }
        }
    }
}
function measureText(text, fontInfo) {
    if (text.length === 0) {
        return 0;
    }
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-50000px';
    container.style.width = '50000px';
    const regularDomNode = document.createElement('span');
    applyFontInfo(regularDomNode, fontInfo);
    regularDomNode.style.whiteSpace = 'pre'; // just like the textarea
    regularDomNode.append(text);
    container.appendChild(regularDomNode);
    document.body.appendChild(container);
    const res = regularDomNode.offsetWidth;
    document.body.removeChild(container);
    return res;
}
