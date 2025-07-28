
export default class MonacoThemes {

    static defineVsDarkExtendedTheme(monaco: any) {
        // vs code dark theme properties: https://github.com/Microsoft/vscode/blob/main/src/vs/editor/standalone/common/themes.ts#L13
        monaco.editor.defineTheme('vs-dark-extended', {
            base: 'vs-dark', // can also be 'vs' or 'hc-black'
            inherit: true, // can also be false to completely replace the base theme
            rules: [
                // these rules are being ignored for some unknown reason
                // { token: '', foreground: 'ff0000', background: '1E1E1E' },
                // { token: 'handlebars-syntax', foreground: '#ff0000' },
                // { token: 'predefined.sql', foreground: '#00ff00' },
                // Add more custom token styles here
            ],
            colors: {
                // 'editor.foreground': '#ff0000',
                'editor.background': '#181c21',
                // 'editor.inactiveSelectionBackground': '#3A3D41',
                // 'editorCursor.foreground': '#FFFFFF',
                // 'editor.lineHighlightBackground': '#2B2B2B',
                // 'editorLineNumber.foreground': '#858585',
                // 'editor.selectionBackground': '#264F78',
                // 'scrollbarSlider.background': '#005555',
                // 'scrollbarSlider.hoverBackground': '#008888',
                // 'scrollbarSlider.activeBackground': '#00AAAA',
            }
        });
        console.log('monaco: ', monaco);

        // monaco.editor.setTheme('vs-dark-extended');
    }
}