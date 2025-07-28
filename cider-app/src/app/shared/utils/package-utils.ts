import { version } from '../../../../package.json';

export default class PackageUtils {
    /**
     * Get the current version of the application
     * 
     * @returns {string} The version of the application
     */
    public static getVersion(): string {
        return version;
    }
}