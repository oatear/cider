

export default class GeneralUtils {

    /**
     * Delay/sleep for x milliseconds
     * 
     * Ex.
     * await delay(1000)
     * 
     * @param ms 
     * @returns 
     */
    public static delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }
}