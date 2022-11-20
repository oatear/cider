

export default class StringUtils {

    private static readonly mimeToExtLookup = {
        'text/html':                             'html',
        'text/css':                              'css',
        'text/xml':                              'xml',
        'image/gif':                             'gif',
        'image/jpeg':                            'jpeg',
        'application/x-javascript':              'js',
        'text/plain':                            'txt',
        'image/png':                             'png',
        'image/tiff':                            'tiff',
        'image/x-icon':                          'ico',
        'image/x-jng':                           'jng',
        'image/x-ms-bmp':                        'bmp',
        'image/svg+xml':                         'svg',
        'image/webp':                            'webp'
    };

    /**
     * Convert the provided string to kebab-case
     * 
     * @param input 
     * @returns 
     */
    public static toKebabCase(input: string): string {
        if (!input) {
            return input;
        }
        return input.trim().replace(/ /g, '-').toLowerCase();
    }

    /**
     * Convert the given mime type into the relevant extension
     * 
     * @param mime 
     * @returns string
     */
    public static mimeToExtension(mime: string): string {
        if (!mime) {
            return mime;
        }
        return StringUtils.mimeToExtLookup.hasOwnProperty(mime) ? 
            (<any>StringUtils.mimeToExtLookup)[mime] : '';
    }
}