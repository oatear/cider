import { ColorPalette } from "./color-generator";

/**
 * Defines the types of gradients available for the main background.
 */
export type GradientType = 'linear' | 'radial';

/**
 * Defines the types of organic textures that can be applied over the background.
 */
export type TextureType = 'stripes' | 'dots' | 'grain' | 'clouds' | 'fibers' | 'marble' | 'voronoi' | 'none';

/**
 * Configuration options for generating the card background SVG.
 */
export interface CardBackgroundOptions {
  /** The width of the SVG in pixels. Defaults to 630. */
  width?: number;
  /** The height of the SVG in pixels. Defaults to 880. */
  height?: number;
  /** An array of CSS color strings to use in the gradient. */
  colors: string[];
  /** The type of gradient to use. Defaults to 'radial'. */
  gradientType?: GradientType;
  /** The angle of the linear gradient in degrees. Defaults to 45. */
  gradientAngle?: number;
  /** The type of organic texture to overlay. Defaults to 'grain'. */
  textureType?: TextureType;
  /** The opacity of the texture layer (0 to 1). Defaults to 0.1. */
  textureOpacity?: number;
  /** The scale of the texture pattern. Larger numbers mean a larger (less dense) pattern. Defaults to 1. */
  textureScale?: number;
  /** The color of the texture itself (e.g., for highlights in the 'marble' texture). Defaults to 'white'. */
  textureColor?: string;
}

/**
 * Generates an SVG string for a trading card game background with robust organic textures.
 *
 * @param options - The configuration for the card background.
 * @returns An SVG string representing the card background.
 */
export function generateCardBackground(options: CardBackgroundOptions): string {
  // 1. Set default values
  const {
    width = 630,
    height = 880,
    colors,
    gradientType = 'radial',
    gradientAngle = 45,
    textureType = 'grain',
    textureOpacity = 0.15,
    textureScale = 1,
    textureColor = 'white',
  } = options;

  if (!colors || colors.length === 0) {
    throw new Error("The 'colors' array must contain at least one color.");
  }

  // Helper to parse CSS color to [r, g, b] array (0-1 scale)
  const colorToRGB = (color: string): [number, number, number] => {
      const d = document.createElement('div');
      d.style.color = color;
      document.body.appendChild(d);
      const rgbStr = window.getComputedStyle(d).color;
      document.body.removeChild(d);
      const [r, g, b] = (rgbStr.match(/\d+/g) || ['0','0','0']).map(Number);
      return [r / 255, g / 255, b / 255];
  };

  const uniqueId = `card-bg-${Math.random().toString(36).substr(2, 9)}`;
  const defs: string[] = [];
  let textureFill = '';

  // 2. Generate Gradient Definition (Unchanged)
  const gradientId = `${uniqueId}-gradient`;
  // ... (gradient logic is the same, so it's omitted for brevity)
  if (gradientType === 'linear') {
    const angleRad = (gradientAngle % 360) * (Math.PI / 180);
    const x1 = Math.round(50 + Math.sin(angleRad + Math.PI) * 50) + '%';
    const y1 = Math.round(50 + Math.cos(angleRad) * 50) + '%';
    const x2 = Math.round(50 + Math.sin(angleRad) * 50) + '%';
    const y2 = Math.round(50 + Math.cos(angleRad + Math.PI) * 50) + '%';
    
    defs.push(`
      <linearGradient id="${gradientId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
        ${colors.map((color, index) => `<stop offset="${(index / (colors.length - 1)) * 100}%" stop-color="${color}" />`).join('')}
      </linearGradient>`);
  } else {
    defs.push(`
      <radialGradient id="${gradientId}">
        ${colors.map((color, index) => `<stop offset="${(index / (colors.length - 1)) * 100}%" stop-color="${color}" />`).join('')}
      </radialGradient>`);
  }


  // 3. Generate ROBUST Organic Texture Definitions
  const textureId = `${uniqueId}-texture`;
  const [r, g, b] = colorToRGB(textureColor);
  switch (textureType) {
    case 'stripes':
      const stripeWidth = 10 * textureScale;
      defs.push(`
        <pattern id="${textureId}" patternUnits="userSpaceOnUse" width="${stripeWidth}" height="${stripeWidth}" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="${stripeWidth}" stroke="white" stroke-width="${stripeWidth / 2}"/>
        </pattern>
      `);
      textureFill = `<rect width="${width}" height="${height}" fill="url(#${textureId})" opacity="${textureOpacity}" />`;
      break;
      
    case 'dots':
      const dotSize = 15 * textureScale;
      const dotRadius = 1.5 * textureScale;
      defs.push(`
        <pattern id="${textureId}" patternUnits="userSpaceOnUse" width="${dotSize}" height="${dotSize}">
          <circle cx="${dotSize / 2}" cy="${dotSize / 2}" r="${dotRadius}" fill="white" />
        </pattern>
      `);
      textureFill = `<rect width="${width}" height="${height}" fill="url(#${textureId})" opacity="${textureOpacity}" />`;
      break;

    case 'grain':
      defs.push(`
        <filter id="${textureId}">
          <feTurbulence type="fractalNoise" baseFrequency="${0.7 / textureScale}" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1 0" />
        </filter>`);
      textureFill = `<rect width="${width}" height="${height}" filter="url(#${textureId})" opacity="${textureOpacity}" style="mix-blend-mode: multiply;"/>`;
      break;

    case 'clouds':
      const baseCloudFreqX = (0.02 / textureScale).toFixed(4);
      const baseCloudFreqY = (0.02 / textureScale).toFixed(4);

      // This filter creates colored noise. No more CSS mix-blend-mode!
      defs.push(`
        <filter id="${textureId}">
          <feTurbulence type="fractalNoise" baseFrequency="${baseCloudFreqX} ${baseCloudFreqY}" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="matrix" in="noise"
            values="0 0 0 0 ${r}
                    0 0 0 0 ${g}
                    0 0 0 0 ${b}
                    0 0 0 0.5 0" 
          />
        </filter>`);
      textureFill = `<rect width="100%" height="100%" filter="url(#${textureId})" opacity="${textureOpacity * 2}" />`;
      break;
    case 'fibers':
      const baseFiberFreqX = (0.01 / textureScale).toFixed(4);
      const baseFiberFreqY = (0.2 / textureScale).toFixed(4);

      // This filter creates colored noise. No more CSS mix-blend-mode!
      defs.push(`
        <filter id="${textureId}">
          <feTurbulence type="fractalNoise" baseFrequency="${baseFiberFreqX} ${baseFiberFreqY}" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="matrix" in="noise"
            values="0 0 0 0 ${r}
                    0 0 0 0 ${g}
                    0 0 0 0 ${b}
                    0 0 0 0.5 0" 
          />
        </filter>`);
      textureFill = `<rect width="100%" height="100%" filter="url(#${textureId})" opacity="${textureOpacity * 2}" />`;
      break;

    case 'marble':
      // FIX: The overlaying rect now has a fill="white". This is crucial.
      // The filter creates the lighting effect on this white canvas.
      defs.push(`
        <filter id="${textureId}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="${(0.03 / textureScale).toFixed(4)}" numOctaves="5" seed="5" result="noise"/>
            <feSpecularLighting surfaceScale="1" specularConstant="0.5" 
                specularExponent="15" lighting-color="${textureColor}" in="noise" result="specular">
                <feDistantLight azimuth="235" elevation="60" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceAlpha" operator="in" result="clip"/>
            <feComponentTransfer in="clip" result="transfer">
              <feFuncA type="linear" slope="${textureOpacity * 10}"/>
            </feComponentTransfer>
        </filter>`);
      // The fill="white" is the key fix here!
      textureFill = `<rect width="${width}" height="${height}" fill="white" filter="url(#${textureId})" />`;
      break;

    case 'voronoi':
      // This effect tints the main gradient with flat, multi-toned cells.
      defs.push(`
        <filter id="${textureId}" color-interpolation-filters="sRGB">
          <!-- 1. Create the base cellular noise -->
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="${(0.015 / textureScale).toFixed(4)}" 
            numOctaves="1" 
            result="noise" 
          />
          <!-- 2. Posterize the noise into a few distinct brightness levels. This creates the hard edges. -->
          <feComponentTransfer in="noise" result="cells">
            <feFuncR type="discrete" tableValues="0.1 0.3 0.5 0.7 0.9" />
            <feFuncG type="discrete" tableValues="0.1 0.3 0.5 0.7 0.9" />
            <feFuncB type="discrete" tableValues="0.1 0.3 0.5 0.7 0.9" />
          </feComponentTransfer>
          <!-- 3. Blend the cells over the original gradient using a hard light effect. -->
          <!-- This tints the background, creating color contrast between cells. -->
          <feBlend mode="hard-light" in="SourceGraphic" in2="cells" />
        </filter>
      `);
      // This filter is applied to the main gradient itself.
      // We will add the filter attribute to the main rect later.
      break;

    case 'none':
    default:
      break;
  }
  
  // 4. Assemble the final SVG string
  const mainRectFilter = ['swirl', 'voronoi', 'crystal'].includes(textureType)
    ? `filter="url(#${textureId})"`
    : '';

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs.join('\n    ')}
  </defs>
  
  <!-- Base Gradient Layer -->
  <rect width="${width}" height="${height}" fill="url(#${gradientId})" ${mainRectFilter}/>
  
  <!-- Robust Texture Overlay -->
  ${textureFill}
</svg>
  `.trim();
}

/**
 * Generates a card background with randomized parameters, now optimized for organic textures.
 * It respects the `width` and `height` from the passed options, but randomizes all other
 * visual properties, including generating a harmonious texture color.
 *
 * @param baseOptions - An options object, primarily to specify width and height.
 * @returns An SVG string representing a randomized card background.
 */
export function generateRandomCardBackground(baseOptions: Partial<CardBackgroundOptions> = {}): string {
  
  // --- This helper function does NOT need to change. ---
  const randomColors = (): string[] => {
    const numColors = Math.floor(Math.random() * 3) + 2; // 2 to 4 colors
    const colors: string[] = [];
    const baseHue = Math.random() * 360;
    const baseSaturation = Math.random() * 30 + 70; // 70-100% (vibrant)
    const baseLightness = Math.random() * 30 + 25;  // 25-55% (not too light or dark)
    
    for (let i = 0; i < numColors; i++) {
      const hue = (baseHue + i * (Math.random() * 40 - 20)) % 360;
      const saturation = Math.max(0, Math.min(100, baseSaturation + Math.random() * 20 - 10));
      const lightness = Math.max(0, Math.min(100, baseLightness + Math.random() * 20 - 10));
      colors.push(`hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`);
    }
    // Sort by lightness to ensure a predictable dark-to-light progression
    return colors.sort((a, b) => {
        const lightA = Number(a.match(/,\s*(\d+)%\)/)![1]);
        const lightB = Number(b.match(/,\s*(\d+)%\)/)![1]);
        return lightA - lightB;
    });
  };

  const generatedColors = randomColors();

  // --- CHANGE #1: Generate a harmonious texture color ---
  // We'll create a highlight color by taking the lightest color from our generated
  // palette and making it even lighter. This ensures the texture color fits the theme.
  const generateTextureColor = (palette: string[]): string => {
    const lightestColor = palette[palette.length - 1]; // Get the last (lightest) color
    const hslMatch = lightestColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      // Make it significantly lighter to act as a highlight
      const newLightness = Math.min(100, parseInt(l, 10) + 30);
      return `hsl(${h}, ${s}%, ${newLightness}%)`;
    }
    return 'white'; // Fallback
  };
  
  // --- CHANGE #2: Update the list of available textures ---
  const textureTypes: TextureType[] = ['stripes', 'dots', 'grain', 'clouds', 'fibers', 'marble', 'voronoi'];
  
  // --- The rest of the randomization logic remains the same ---
  const gradientTypes: GradientType[] = ['linear', 'radial'];
  const randomGradientType = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
  const randomTextureType = textureTypes[Math.floor(Math.random() * textureTypes.length)];
  const randomGradientAngle = Math.floor(Math.random() * 360);
  const randomTextureOpacity = parseFloat((Math.random() * 0.12 + 0.11).toFixed(3)); // 0.11 to 0.26
  const randomTextureScale = parseFloat((Math.random() * 1.8 + 0.7).toFixed(2)); // 0.7 to 2.5

  // 3. Assemble the final options object, now including the new properties
  const randomOptions: CardBackgroundOptions = {
    // Use width/height from baseOptions, or fall back to defaults
    width: baseOptions.width,
    height: baseOptions.height,
    
    // Use the randomized values
    colors: generatedColors,
    gradientType: randomGradientType,
    gradientAngle: randomGradientAngle,
    textureType: randomTextureType,
    textureOpacity: randomTextureOpacity,
    textureScale: randomTextureScale,
    textureColor: generateTextureColor(generatedColors), // Add the new property
  };

//   randomOptions.textureType = 'swirl';

  console.log('background options: ', randomOptions);
  
  // 4. Call the original generator with the fully randomized options
  return generateCardBackground(randomOptions);
}