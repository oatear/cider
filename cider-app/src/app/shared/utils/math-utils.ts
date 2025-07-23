export default class MathUtils {

    /**
     * Create a random integer between the values (inclusive)
     * 
     * @param min 
     * @param max 
     * @returns 
     */
    public static randomInt(min: number, max: number): number {
        const low = Math.ceil(min);
        const high = Math.floor(max);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }

    /**
     * Create an array of numbers
     * 
     * @param start 
     * @param end 
     * @param step 
     * @returns 
     */
    public static range(start: number, end: number, step: number = 1): number[] {
        const length = Math.floor((end - start + 1) / step);
        return Array.from({ length }, (_, index) => start + index * step);
    }
}