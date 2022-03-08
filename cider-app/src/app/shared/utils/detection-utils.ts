/**
 * Detection Utils
 */
export default class DetectionUtils {

    /**
     * Determine if the current browser is a mobile browser
     * 
     * @returns 
     */
    public static isMobileBrowser(): boolean {
        return /iPad|iPhone|Android|webOS/i.test(navigator.userAgent);
    }
}