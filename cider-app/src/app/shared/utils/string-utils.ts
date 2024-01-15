import { mimeTypes } from "mime-wrapper";

export default class StringUtils {

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
        return ('' + input).trim().replace(/ /g, '-').toLowerCase();
    }

    /**
     * Convert the provided kebab-case string into title case
     * 
     * Ex. 'chicken-kebab' -> 'Chicken Kebab'
     * 
     * @param input 
     * @returns 
     */
    public static kebabToTitleCase(input: string): string {
        if (!input) {
            return input;
        }
        return input.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    /**
     * Split the file name and extension
     * 
     * @param filename 
     * @returns 
     */
    public static splitNameAndExtension(filename: string): { name: string; extension: string; } {
        if (!filename) {
            return {name: '', extension: ''};
        }
        const indexOfPeriod = filename.lastIndexOf('.');
        if (indexOfPeriod <= 0) {
            return {name: filename, extension: ''};
        }
        return {
            name: filename.substring(0, indexOfPeriod), 
            extension: filename.substring(indexOfPeriod + 1)
        };
    }

    /**
     * Get the last directory from the given url string
     * 
     * @param url 
     * @ returns
     */
    public static lastDirectoryFromUrl(url: string) {
        let index = url.lastIndexOf('/') > 0 ? url.lastIndexOf('/') : url.lastIndexOf('\\');
        let name = url.substring(index + 1 | 0);
        return name;
    }

    /**
     * Convert the given mime type into the relevant extension
     * 
     * @param mime 
     * @returns string
     */
    public static mimeToExtension(mime: string): string {
        if (!mime) {
            return '';
        }
        return mimeTypes.getExtension(mime);
    }

    /**
     * Convert the given file extension into the relevalt mime type
     * 
     * @param ext 
     * @returns 
     */
    public static extensionToMime(ext: string): string {
        if (!ext) {
            return '';
        }
        return mimeTypes.getType(ext);
    }
}