import { trigger } from "@angular/animations";
import * as Handlebars from 'handlebars';

export default class MonacoLanguages {

    static createCssWorker(monaco: any): any {
        return monaco.editor.createWebWorker({
            // module that exports the create() method and returns a `CSSWorker` instance
            moduleId: 'vs/language/css/cssWorker',
            label: 'css',

            // passed in to the create() method
            createData: {
                options: MonacoLanguages.optionsDefault,
                languageId: 'css',
            }
        });
    }

    static createWorkerPromise(worker: any): any {
        return (resource: any) => worker.getProxy()
            .then((client: any) => worker.withSyncedResources([resource])
            .then((worker: any) => client));
    }

    static createHandlebarsCompletionProvider(monaco: any): any {
        return {
            triggerCharacters: ['{'],
            provideCompletionItems: (model: any, position: any) => {
                if (!MonacoLanguages.isInsideHandlebars(model, position)) {
                    return { suggestions: [] };
                }
                const wordInfo = model.getWordUntilPosition(position);
                const wordRange: any = {
                    startLineNumber: position.lineNumber,
                    startColumn: wordInfo.startColumn,
                    endLineNumber: position.lineNumber,
                    endColumn: wordInfo.endColumn
                };

                // setup card attributes suggestions
                const variables = ['card.name', 'card.description', 'card.count', 'assets'];
                const variableSuggestions = variables.map(variable => {
                    return {
                        label: variable,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: variable,
                        documentation: variable,
                        range: wordRange
                    };
                });

                const snippetKeys = ['if', 'repeat', 'each', 'with', 'unless', 'else'];
                const snippetSuggestions = snippetKeys.map(snippet => {
                    return {
                        label: '#' + snippet,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: snippet + ' }}\n\t$0\n{{/' + snippet,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: snippet,
                        range: wordRange
                    };
                });

                // setup handlebars helpers suggestions
                const helpers = Handlebars.helpers;
                const helperExclusions = ['helperMissing', 'blockHelperMissing', 'compileImages', ...snippetKeys];
                const helperKeys = Object.keys(Handlebars.helpers).filter(key => helperExclusions.indexOf(key) === -1);
                const helperSuggestions = helperKeys.map(key => {
                    const helper = helpers[key];
                    return {
                        label: key,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: key + ' ',
                        documentation: key,
                        range: wordRange
                    };
                });
            
                const suggestions: any[] = [
                    ...snippetSuggestions,
                    ...variableSuggestions,
                    ...helperSuggestions,
                    // … add more suggestions as needed
                ];
                return { suggestions: suggestions };
            }
        }
    }

    static createCssCompletionProvider(monaco: any, cssWorker: any): any {
        return {
            triggerCharacters: ['/', '-', ':'],
            provideCompletionItems: (model: any, position: any) => {
                if (MonacoLanguages.isInsideHandlebars(model, position)) {
                    return { suggestions: [] };
                }
            
                const resource = model.uri;
                return cssWorker.getProxy().then((client: any) => {
                    return cssWorker.withSyncedResources([resource]).then((worker: any) => {
                        return client.doComplete(resource.toString(), MonacoLanguages.fromPosition(position));
                    });
                }).then((info: any) => {
                    if (!info) {
                        return;
                    }
                    const wordInfo = model.getWordUntilPosition(position);
                    const wordRange: any = {
                        startLineNumber: position.lineNumber,
                        startColumn: wordInfo.startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn: wordInfo.endColumn
                    };
    
                    const items: any[] = info.items.map((entry: any) => {
                        const item: any = {
                            label: entry.label,
                            insertText: entry.insertText || entry.label,
                            sortText: entry.sortText,
                            filterText: entry.filterText,
                            documentation: entry.documentation,
                            detail: entry.detail,
                            command: MonacoLanguages.toCommand(entry.command),
                            range: wordRange,
                            kind: MonacoLanguages.toCompletionItemKind(entry.kind)
                        };
                        if (entry.textEdit) {
                            if (MonacoLanguages.isInsertReplaceEdit(entry.textEdit)) {
                                item.range = {
                                    insert: MonacoLanguages.toRange(entry.textEdit.insert),
                                    replace: MonacoLanguages.toRange(entry.textEdit.replace)
                                };
                            } else {
                                item.range = MonacoLanguages.toRange(entry.textEdit.range);
                            }
                            item.insertText = entry.textEdit.newText;
                        }
                        if (entry.additionalTextEdits) {
                            item.additionalTextEdits =
                                entry.additionalTextEdits.map(MonacoLanguages.toTextEdit);
                        }
                        if (entry.insertTextFormat === 2) {
                            item.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
                        }
                        return item;
                    });
    
                    return {
                        isIncomplete: info.isIncomplete,
                        suggestions: items
                    };
                });
    
            }
        };
    }

    // Utility function to detect if the current position is inside a Handlebars block.
    static isInsideHandlebars(model: any, position: any): boolean {
        // Scan backwards for '{{'
        const lineContent = model.getLineContent(position.lineNumber);
        const lastIndexOfOpen = lineContent.lastIndexOf('{{');
        return lastIndexOfOpen > -1 && position.column > lastIndexOfOpen;
    }

    static fromPosition(position: any): any {
        if (!position) {
            return void 0;
        }
        return { character: position.column - 1, line: position.lineNumber - 1 };
    }


    static toTextEdit(textEdit: any): any {
        if (!textEdit) {
            return void 0;
        }
        return {
            range: MonacoLanguages.toRange(textEdit.range),
            text: textEdit.newText
        };
    }

    static isInsertReplaceEdit(edit: any): any {
        return (
            typeof (<any>edit).insert !== 'undefined' &&
            typeof (<any>edit).replace !== 'undefined'
        );
    }

    static fromRange(range: any): any {
        if (!range) {
            return void 0;
        }
        return {
            start: {
                line: range.startLineNumber - 1,
                character: range.startColumn - 1
            },
            end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
        };
    }

    static toRange(range: any): any {
        if (!range) {
            return void 0;
        }
        return {
            startLineNumber: range.start.line + 1,
            startColumn: range.start.character + 1,
            endLineNumber: range.end.line + 1,
            endColumn: range.end.character + 1
        };
    }

    static toCommand(c: any): any {
        return c && c.command === 'editor.action.triggerSuggest'
            ? { id: c.command, title: c.title, arguments: c.arguments }
            : undefined;
    }

    static toCompletionItemKind(kind: number | undefined): any {
        const monaco: any = (window as any).monaco;
        switch (kind) {
            case 0: return monaco.languages.CompletionItemKind.Text;
            case 1: return monaco.languages.CompletionItemKind.Method;
            case 2: return monaco.languages.CompletionItemKind.Function;
            case 3: return monaco.languages.CompletionItemKind.Constructor;
            case 4: return monaco.languages.CompletionItemKind.Field;
            case 5: return monaco.languages.CompletionItemKind.Variable;
            case 6: return monaco.languages.CompletionItemKind.Class;
            case 7: return monaco.languages.CompletionItemKind.Interface;
            case 8: return monaco.languages.CompletionItemKind.Module;
            case 9: return monaco.languages.CompletionItemKind.Property;
            case 10: return monaco.languages.CompletionItemKind.Unit;
            case 11: return monaco.languages.CompletionItemKind.Value;
            case 12: return monaco.languages.CompletionItemKind.Enum;
            case 13: return monaco.languages.CompletionItemKind.Keyword;
            case 14: return monaco.languages.CompletionItemKind.Snippet;
            case 15: return monaco.languages.CompletionItemKind.Color;
            case 16: return monaco.languages.CompletionItemKind.File;
            case 17: return monaco.languages.CompletionItemKind.Reference;
        }
        return kind;
    }

    static optionsDefault: any = {
        validate: true,
        lint: {
            compatibleVendorPrefixes: 'ignore',
            vendorPrefix: 'warning',
            duplicateProperties: 'warning',
            emptyRules: 'warning',
            importStatement: 'ignore',
            boxModel: 'ignore',
            universalSelector: 'ignore',
            zeroUnits: 'ignore',
            fontFaceProperties: 'warning',
            hexColorLength: 'error',
            argumentsInColorFunction: 'error',
            unknownProperties: 'warning',
            ieHack: 'ignore',
            unknownVendorSpecificProperties: 'ignore',
            propertyIgnoredDueToDisplay: 'warning',
            important: 'ignore',
            float: 'ignore',
            idSelector: 'ignore'
        },
        data: { useDefaultDataProvider: true },
        format: {
            newlineBetweenSelectors: true,
            newlineBetweenRules: true,
            spaceAroundSelectorSeparator: false,
            braceStyle: 'collapse',
            maxPreserveNewLines: undefined,
            preserveNewLines: true
        }
    };
}

export class DocumentColorAdapter {
    constructor(private readonly _worker: any) {}

    public provideDocumentColors(model: any, token: any): Promise<any> {
        const resource = model.uri;

        return this._worker(resource)
            .then((worker: any) => worker.findDocumentColors(resource.toString()))
            .then((infos: any) => {
                if (!infos) {
                    return;
                }
                return infos.map((item: any) => ({
                    color: item.color,
                    range: MonacoLanguages.toRange(item.range)
                }));
            });
    }

    public provideColorPresentations(model: any, info: any, token: any): Promise<any> {
        const resource = model.uri;

        return this._worker(resource)
            .then((worker: any) =>
                worker.getColorPresentations(resource.toString(), info.color, MonacoLanguages.fromRange(info.range))
            )
            .then((presentations: any) => {
                if (!presentations) {
                    return;
                }
                return presentations.map((presentation: any) => {
                    let item: any = {
                        label: presentation.label
                    };
                    if (presentation.textEdit) {
                        item.textEdit = MonacoLanguages.toTextEdit(presentation.textEdit);
                    }
                    if (presentation.additionalTextEdits) {
                        item.additionalTextEdits =
                            presentation.additionalTextEdits.map(MonacoLanguages.toTextEdit);
                    }
                    return item;
                });
            });
    }
}