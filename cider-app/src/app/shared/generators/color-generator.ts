
export interface ColorPalette {
    hue: number;
    isLightOnDark: boolean;
    dark: string;
    medium: string;
    light: string;
}

export class ColorGenerator {
    
    /**
     * Generates a harmonious color palette based on a single random hue.
     * @returns An object with 'dark', 'medium', and 'light' color strings in HSL format.
     */
    public static generateHarmoniousPalette(hue?: number): ColorPalette {
        const baseHue = hue ? hue : Math.random() * 360;
        const saturation = Math.random() * 30 + 40; // 40-70% (not too garish)
        // const saturation = Math.random() * 40 + 60; // 60-100% (vibrant)
        const isLightOnDark = Math.random() < 0.5;
    
        const darkLightness = Math.random() * 15 + 15;   // 15-30%
        const mediumLightness = Math.random() * 20 + 40; // 40-60%
        const lightLightness = Math.random() * 15 + 80;  // 80-95%
    
        return {
            hue: baseHue,
            isLightOnDark: isLightOnDark,
            dark: `hsl(${baseHue.toFixed(0)}, ${saturation.toFixed(0)}%, ${darkLightness.toFixed(0)}%)`,
            medium: `hsl(${baseHue.toFixed(0)}, ${saturation.toFixed(0)}%, ${mediumLightness.toFixed(0)}%)`,
            light: `hsl(${baseHue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightLightness.toFixed(0)}%)`,
        };
    }
}