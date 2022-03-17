

export default class StringUtils {

    /**
     * Convert the provided string to kebab-case
     * 
     * @param input 
     * @returns 
     */
    public static toKebabCase(input: string) {
        if (!input) {
            return input;
        }
        return input.trim().replace(/ /g, '-').toLowerCase();
    }
}