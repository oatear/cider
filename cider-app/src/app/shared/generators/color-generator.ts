
export interface ColorPalette {
  /** The base hue (0-360) for the palette. */
  hue: number;
  /** The base saturation (0-100) for the main colors. */
  saturation: number;
  /**
   * Determines the relationship between front and back colors.
   * `true` = light front color on a dark back color.
   * `false` = dark front color on a light back color.
   */
  isLightOnDark: boolean;

  /** The primary foreground color (e.g., the frame itself). */
  front: string;
  /** The primary background color (e.g., inside the frame). */
  back: string;
  /** A neutral color for the page background, designed to contrast with the palette. */
  background: string;
  /** The color for outlines and strokes. */
  outline: string;
  /** A general-purpose accent or text color, usually has high contrast with `back`. */
  color: string;
}

export class ColorGenerator {
    /**
     * Generates a harmonious and descriptive color palette.
     *
     * @param preset A partial ColorPalette object. Any provided values will be
     *        used instead of being randomly generated. This allows for fine-tuned
     *        control, like generating a full palette from a single preset hue.
     * @returns A complete ColorPalette object.
     */
    public static generateHarmoniousPalette(
        preset: Partial<ColorPalette> = {}
    ): ColorPalette {
        const hue = preset.hue ?? Math.random() * 360;
        const saturation = preset.saturation ?? Math.random() * 20 + 30; // 30-50% (not too garish)
        const isLightOnDark = preset.isLightOnDark ?? (Math.random() < 0.5); // ignored for now

        const frontLightness = Math.random() * 15 + 70; // 70-85% (a clear, bright tone)
        const backLightness = Math.random() * 15 + 55;  // 55-70% (a solid mid-dark tone)
        const backgroundLightness = Math.random() * 15 + 40; // 40-55%
        const outlineLightness = Math.random() * 15 + 10; // 10-25% (very dark for high contrast)
        const colorLightness = outlineLightness; // 10-25% (very dark for high contrast)

        const front = `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${frontLightness.toFixed(0)}%)`;
        const back = `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${backLightness.toFixed(0)}%)`;
        const background = `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${backgroundLightness.toFixed(0)}%)`;
        const outline = `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${outlineLightness.toFixed(0)}%)`;
        const color = `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${colorLightness.toFixed(0)}%)`;

        const finalPalette: ColorPalette = {
            hue,
            saturation,
            isLightOnDark,
            front: preset.front ?? front,
            back: preset.back ?? back,
            outline: preset.outline ?? outline,
            background: preset.background ?? background,
            color: preset.color ?? color,
        };

        return finalPalette;
    }
}