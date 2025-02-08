import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';
import MonacoLanguages, { DocumentColorAdapter } from './monaco-languages';
import MonacoThemes from './monaco-themes';

export default class MonacoExtension {

    static monacoConfig: NgxMonacoEditorConfig = {
        // needed for electron
        baseUrl: 'assets', 
        requireConfig: { preferScriptTags: true },
        onMonacoLoad: MonacoExtension.loadMonacoEditor,
    };

    static loadMonacoEditor() {
        const monaco: any = (window as any).monaco;
        // create the css-handlebars language
        MonacoExtension.registerCssHandlebars(monaco);
        MonacoThemes.defineVsDarkExtendedTheme(monaco);

        // extend the handlebars language
        const handlebarsCompletionProvider = MonacoLanguages.createHandlebarsCompletionProvider(monaco);
        monaco.languages.registerCompletionItemProvider('handlebars', handlebarsCompletionProvider);
    }

    static registerCssHandlebars(monaco: any) {
        monaco.languages.register({ id: 'css-handlebars' });

        // Get the existing CSS language configuration and tokenizer
        // https://github.com/microsoft/monaco-editor/blob/main/src/basic-languages/css/css.ts
        const cssLanguage = monaco.languages.getLanguages().find((lang: { id: string; }) => lang.id === 'css');
        if (cssLanguage) {
            cssLanguage.loader().then((cssModule: any) => {
                const cssLanguage = cssModule.language;
                const cssTokenizer = cssLanguage.tokenizer;
                const cssConfiguration = cssModule.conf;

                // Extend the CSS tokenizer to include Handlebars
                const handlebarsTokenizer = {
                    ...cssTokenizer,
                    root: [
                        [/\{\{/, { token: 'delimiter.handlebars', next: '@handlebars' }],
                        ...cssTokenizer.root,
                    ],
                    handlebars: [
                        [/\}\}/, { token: 'delimiter.handlebars', next: '@pop' }],
                        [/[^}]+/, 'metatag'],
                    ],
                };
                for (let key in cssTokenizer) {
                    handlebarsTokenizer[key] = [
                        [/\{\{/, { token: 'delimiter.handlebars', next: '@handlebars' }],
                        ...cssTokenizer[key]
                    ];
                }

                const handlebarsConfiguration = {
                    ...cssConfiguration,
                    brackets: [
                        ['{{', '}}'],
                        ...cssConfiguration.brackets
                    ],
                    // blockComment: ['{{!--', '--}}'],
                }

                // Merge the extended tokenizer with the existing CSS tokenizer
                const extendedLanguage = {
                    ...cssLanguage,
                    tokenizer: handlebarsTokenizer,
                };

                // Register the new language with the extended tokenizer and configuration
                monaco.languages.register({ id: 'css-handlebars' });
                monaco.languages.setMonarchTokensProvider('css-handlebars', extendedLanguage);
                monaco.languages.setLanguageConfiguration('css-handlebars', handlebarsConfiguration);

                // Create and cache the CSS worker promise (do this once during initialization)
                const cssWorker = MonacoLanguages.createCssWorker(monaco);
                const cssWorkerPromise = MonacoLanguages.createWorkerPromise(cssWorker);
                
                // 3. Register the CSS completion provider by delegating to the CSS worker
                const cssCompletionProvider = MonacoLanguages.createCssCompletionProvider(monaco, cssWorker);
                const handlebarsCompletionProvider = MonacoLanguages.createHandlebarsCompletionProvider(monaco);
                monaco.languages.registerCompletionItemProvider('css-handlebars', cssCompletionProvider);
                monaco.languages.registerCompletionItemProvider('css-handlebars', handlebarsCompletionProvider);
                monaco.languages.registerColorProvider('css-handlebars', new DocumentColorAdapter(cssWorkerPromise));
            });
        }
    }

}