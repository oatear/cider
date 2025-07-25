import { ColorGenerator, ColorPalette } from "./color-generator";

/**
 * A simple helper function to clamp a number between a min and max value.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * A helper function to generate the 'd' attribute for a random, potentially concave,
 * and perfectly centered SVG path.
 *
 * @param width The width of the generation area.
 * @param height The height of the generation area.
 * @param complexity The number of anchor points for the shape. More points = more complex.
 * @returns An SVG path data string.
 */
function generateRandomBlobPath(width: number, height: number, complexity: number): string {
  const points: { x: number; y: number }[] = [];

  // 1. Generate a set of random points within the canvas
  for (let i = 0; i < complexity; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }

  // --- NEW SCALE AND CENTER LOGIC ---
  // 2. Calculate the actual bounding box of the generated points
  const bbox = points.reduce(
    (acc, p) => ({
      minX: Math.min(acc.minX, p.x),
      maxX: Math.max(acc.maxX, p.x),
      minY: Math.min(acc.minY, p.y),
      maxY: Math.max(acc.maxY, p.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  const shapeWidth = bbox.maxX - bbox.minX;
  const shapeHeight = bbox.maxY - bbox.minY;

  // Handle a rare edge case where all points are on a single line
  if (shapeWidth === 0 || shapeHeight === 0) {
    // Fallback to a simple rectangle to avoid division by zero
    const padding = Math.min(width, height) * 0.1;
    return `M${padding},${padding} L${width - padding},${padding} L${width - padding},${height - padding} L${padding},${height - padding}Z`;
  }

  // 3. Determine the scale factor to make the shape fill the canvas
  // We add padding to prevent the shape from touching the edges.
  const padding = Math.min(width, height) * 0.1; // 10% padding
  const targetWidth = width - padding * 2;
  const targetHeight = height - padding * 2;

  const scaleX = targetWidth / shapeWidth;
  const scaleY = targetHeight / shapeHeight;

  // Use the smaller scale factor to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // 4. Transform points to be scaled and centered
  const transformedPoints = points.map(p => {
    // First, normalize the point's position so it's relative to the bounding box's top-left corner
    const normalizedX = p.x - bbox.minX;
    const normalizedY = p.y - bbox.minY;

    // Scale the normalized point
    const scaledX = normalizedX * scale;
    const scaledY = normalizedY * scale;

    // Calculate the offset needed to center the newly scaled shape
    const finalShapeWidth = shapeWidth * scale;
    const finalShapeHeight = shapeHeight * scale;
    const offsetX = (width - finalShapeWidth) / 2;
    const offsetY = (height - finalShapeHeight) / 2;

    return {
      x: scaledX + offsetX,
      y: scaledY + offsetY,
    };
  });
  // --- END OF NEW SCALE AND CENTER LOGIC ---

  // 5. Find the centroid of the *transformed* points and sort them by angle
  const centroid = transformedPoints.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  centroid.x /= complexity;
  centroid.y /= complexity;

  transformedPoints.sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
    return angleA - angleB;
  });
  
  // 6. Generate the path string using the transformed points
  let d = `M${transformedPoints[0].x.toFixed(2)},${transformedPoints[0].y.toFixed(2)}`;
  for (let i = 0; i < complexity; i++) {
    const p0 = transformedPoints[(i - 1 + complexity) % complexity];
    const p1 = transformedPoints[i];
    const p2 = transformedPoints[(i + 1) % complexity];
    const p3 = transformedPoints[(i + 2) % complexity];
    
    // These control points create the smooth, blobby effect
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    
    // The clamp is a good failsafe, but our new logic should keep points within bounds
    d += ` C${clamp(cp1x, 0, width).toFixed(2)},${clamp(cp1y, 0, height).toFixed(2)} ${clamp(cp2x, 0, width).toFixed(2)},${clamp(cp2y, 0, height).toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return d + 'Z';
}

/**
 * Generates a geometric, symmetric, or variably chaotic SVG path that is
 * always centered and scaled to fit the given dimensions.
 *
 * @param width The width of the generation area.
 * @param height The height of the generation area.
 * @param numPoints The number of primary vertices for the shape (e.g., 5 for a pentagon or 5-point star).
 * @param turbulence A value from 0.0 to 1.0. 0 is a perfect shape; higher values add noise to the edges.
 * @param isStar If true, generates a star shape by alternating between outer and inner radii.
 * @param starInnerScale The ratio of the inner radius to the outer radius for stars (e.g., 0.5).
 * @returns An SVG path data string.
 */
function generateGeometricPath(
    width: number,
    height: number,
    numPoints: number,
    turbulence: number,
    isStar: boolean = false,
    starInnerScale: number = 0.5
): string {
    const pointsCount = Math.max(3, numPoints);
    const center = { x: width / 2, y: height / 2 };
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * starInnerScale;

    // --- 1. Generate the base "skeleton" points for the polygon or star ---
    const basePoints: { x: number; y: number }[] = [];
    const angleStep = (Math.PI * 2) / (isStar ? pointsCount * 2 : pointsCount);

    const totalVertices = isStar ? pointsCount * 2 : pointsCount;
    for (let i = 0; i < totalVertices; i++) {
        const radius = isStar ? (i % 2 === 0 ? outerRadius : innerRadius) : outerRadius;
        const angle = i * angleStep - Math.PI / 2; // Start at the top

        basePoints.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
        });
    }

    // --- 2. Apply turbulence by subdividing and displacing edge midpoints ---
    let finalPoints: { x: number; y: number }[] = [];
    if (turbulence <= 0) {
        finalPoints = basePoints; // No turbulence, use the perfect shape
    } else {
        const subdivisions = 3; // Add 3 noisy points per edge
        basePoints.forEach((p1, i) => {
            const p2 = basePoints[(i + 1) % basePoints.length];
            finalPoints.push(p1); // Add the starting vertex

            const segmentVec = { x: p2.x - p1.x, y: p2.y - p1.y };
            const segmentLength = Math.sqrt(segmentVec.x ** 2 + segmentVec.y ** 2);
            // Perpendicular vector for displacement
            const perpVec = { x: -segmentVec.y, y: segmentVec.x };

            for (let j = 1; j <= subdivisions; j++) {
                const t = j / (subdivisions + 1); // Position along the segment (e.g., 0.25, 0.5, 0.75)
                const pointOnEdge = { x: p1.x + segmentVec.x * t, y: p1.y + segmentVec.y * t };

                // Calculate displacement. Max displacement is a fraction of the edge length.
                const displacement = (Math.random() - 0.5) * segmentLength * turbulence * 0.5;
                
                const displacedPoint = {
                    x: pointOnEdge.x + perpVec.x / segmentLength * displacement,
                    y: pointOnEdge.y + perpVec.y / segmentLength * displacement,
                };
                finalPoints.push(displacedPoint);
            }
        });
    }

    // --- 3. Scale and center the final shape to fit the canvas perfectly ---
    const bbox = finalPoints.reduce(
        (acc, p) => ({
            minX: Math.min(acc.minX, p.x), maxX: Math.max(acc.maxX, p.x),
            minY: Math.min(acc.minY, p.y), maxY: Math.max(acc.maxY, p.y),
        }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
    const shapeBounds = { w: bbox.maxX - bbox.minX, h: bbox.maxY - bbox.minY };
    if (shapeBounds.w === 0 || shapeBounds.h === 0) return "M0 0Z"; // Avoid division by zero

    const padding = Math.min(width, height) * 0.05; // 5% padding
    const targetSize = { w: width - padding * 2, h: height - padding * 2 };
    const scale = Math.min(targetSize.w / shapeBounds.w, targetSize.h / shapeBounds.h);

    const scaledAndCenteredPoints = finalPoints.map(p => {
        const normX = p.x - bbox.minX;
        const normY = p.y - bbox.minY;
        const scaledX = normX * scale;
        const scaledY = normY * scale;
        const finalShapeSize = { w: shapeBounds.w * scale, h: shapeBounds.h * scale };
        const offsetX = (width - finalShapeSize.w) / 2;
        const offsetY = (height - finalShapeSize.h) / 2;
        return { x: scaledX + offsetX, y: scaledY + offsetY };
    });

    // --- 4. Build the final SVG path data string ---
    if (turbulence <= 0) { // For perfect shapes, use straight lines
        let d = `M ${scaledAndCenteredPoints[0].x.toFixed(2)},${scaledAndCenteredPoints[0].y.toFixed(2)}`;
        for (let i = 1; i < scaledAndCenteredPoints.length; i++) {
            d += ` L ${scaledAndCenteredPoints[i].x.toFixed(2)},${scaledAndCenteredPoints[i].y.toFixed(2)}`;
        }
        return d + 'Z';
    } else { // For turbulent shapes, use smooth curves
        let d = `M ${scaledAndCenteredPoints[0].x.toFixed(2)},${scaledAndCenteredPoints[0].y.toFixed(2)}`;
        const len = scaledAndCenteredPoints.length;
        for (let i = 0; i < len; i++) {
            const p0 = scaledAndCenteredPoints[(i - 1 + len) % len];
            const p1 = scaledAndCenteredPoints[i];
            const p2 = scaledAndCenteredPoints[(i + 1) % len];
            const p3 = scaledAndCenteredPoints[(i + 2) % len];
            const cp1x = p1.x + (p2.x - p0.x) / 6; const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6; const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
        }
        return d; // 'Z' is not needed because the curve loop closes on its own.
    }
}

export type MirrorOption = 'vertical' | 'horizontal' | 'both' | 'none';
export type ShapeOption = 'blob' | 'star' | 'convex' | 'none';
export type BackgroundOption = 'solid' | 'none';

export interface ShapeOptions {
    /** The shape option. Defaults to 'blob' */
    type?: ShapeOption;
    /** The CSS color for the fill of the shape. Defaults to 'white'. */
    fillColor?: string;
    /** The CSS color for the outline. Defaults to '#333'. */
    outlineColor?: string;
    /** The width of the outlines in pixels. Defaults to 2. */
    outlineWidth?: number;
    /** The mirroring option for the symbol. Defaults to 'none'. */
    mirror?: MirrorOption;
    /** The shape scale. */
    scale?: number;
    /** The ratio of the inner radius to the outer radius for stars (e.g., 0.5). */
    starInnerScale?: number;
    /** The number of primary vertices for the shape (e.g., 5 for a pentagon or 5-point star). */
    numPoints?: number;
    /** A value from 0.0 to 1.0. 0 is a perfect shape; higher values add noise to the edges. */
    turbulence?: number;
}

export interface CardSymbolOptions {
  /** The width of the SVG in pixels. Defaults to 100. */
  width?: number;
  /** The height of the SVG in pixels. Defaults to 100. */
  height?: number;
  /** The foreground shape options. */
  frontShape?: ShapeOptions;
  /** The background shape options. */
  backShape?: ShapeOptions;
  /** The background option */
  backgroundType?: BackgroundOption;
  /** The background color */
  backgroundColor?: string;
  /** The color palette */
  palette?: ColorPalette;
}

/**
 * Generates a procedurally created SVG of a random symbol icon with extensive options.
 *
 * @param options The configuration for the symbol.
 * @returns An SVG string representing the generated symbol.
 */
export function generateCardSymbol(options?: CardSymbolOptions): string {
  const {
    width = 100,
    height = 100,
    frontShape = {
        scale: 0.7, type: 'blob', fillColor: 'white',
        starInnerScale: 0.8, outlineColor: '#333', 
        mirror: 'none', outlineWidth: 2
    },
    backShape = {
        scale: 1.0, type: 'blob', fillColor: 'grey',
        starInnerScale: 0.8, outlineColor: '#333', 
        mirror: 'none', outlineWidth: 2
    },
    backgroundType,
    backgroundColor,
  } = options || {};

  const patternWidth = width;
  const patternHeight = height;

  let useElements = '';
  let symbolDef = '';
  [backShape, frontShape].forEach((shape) => {
    // setup outline
    const outlineStroke = shape.outlineWidth && shape.outlineWidth > 0 
      ? `stroke="${shape.outlineColor}" stroke-width="${shape.outlineWidth}"` : '';

    // Center the smaller shape within the pattern area
    const scale = shape.scale || 1.0;
    const translateX = (patternWidth - patternWidth * scale) / 2;
    const translateY = (patternHeight - patternHeight * scale) / 2;

    // Generate element
    let pathData = '';
    let element = '';
    switch(shape.type) {
        case 'blob':
            pathData = generateRandomBlobPath(patternWidth * scale, patternHeight * scale, 5);
            element = `<path d="${pathData}" fill="${shape.fillColor}" ${outlineStroke} transform="translate(${translateX}, ${translateY})" />`;
            break;
        case 'star':
            pathData = generateGeometricPath(patternWidth * scale, patternHeight * scale, 
              shape.numPoints || 6, shape.turbulence || 0, true, 0.8);
            element = `<path d="${pathData}" fill="${shape.fillColor}" ${outlineStroke} transform="translate(${translateX}, ${translateY})" />`;
            break;
        case 'convex':
            pathData = generateGeometricPath(patternWidth * scale, patternHeight * scale, 
              shape.numPoints || 6, shape.turbulence || 0, false);
            element = `<path d="${pathData}" fill="${shape.fillColor}" ${outlineStroke} transform="translate(${translateX}, ${translateY})" />`;
            break;
    }

    // Generate symbol definition and use elements
    const uniqueId = `symbol-${Math.random().toString(36).substr(2, 9)}`;
    const symbolId = `${uniqueId}-pattern`;
    symbolDef += `
        <symbol id="${symbolId}" viewBox="0 0 ${patternWidth} ${patternHeight}">
        ${element}
        </symbol>
    `;
    switch(shape.mirror) {
        case 'both':
        useElements += `
            <use href="#${symbolId}" x="0" y="0" width="${patternWidth}" height="${patternHeight}" />
            <use href="#${symbolId}" x="0" y="0" width="${patternWidth}" height="${patternHeight}" transform="translate(${width}, 0) scale(-1, 1)" />
            <use href="#${symbolId}" x="0" y="0" width="${patternWidth}" height="${patternHeight}" transform="translate(0, ${height}) scale(1, -1)" />
            <use href="#${symbolId}" x="0" y="0" width="${patternWidth}" height="${patternHeight}" transform="translate(${width}, ${height}) scale(-1, -1)" />
        `;
        break;
        case 'horizontal':
        useElements += `
            <use href="#${symbolId}" x="0" y="0" width="${patternWidth}" height="${height}" />
            <use href="#${symbolId}" x="0" y="0" width="${patternWidth}" height="${height}" transform="translate(${width}, 0) scale(-1, 1)" />
        `;
        break;
        case 'vertical':
        useElements += `
            <use href="#${symbolId}" x="0" y="0" width="${width}" height="${patternHeight}" />
            <use href="#${symbolId}" x="0" y="0" width="${width}" height="${patternHeight}" transform="translate(0, ${height}) scale(1, -1)" />
        `;
        break;
        default:
        useElements += `
            <use href="#${symbolId}" x="0" y="0" width="${width}" height="${height}" />
        `;
        break;
    }
  });

  // add background if background has been set
  let backgroundRect = '';
  if (backgroundType == 'solid') {
    backgroundRect = `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${symbolDef}
  </defs>
  ${backgroundRect}
  ${useElements}
</svg>`.trim();
}

/**
 * Generates a procedurally created symbol with randomized creative parameters.
 * It respects any structural options passed in (like width and height).
 *
 * @param baseOptions An options object, primarily to specify fixed parameters like width and height.
 * @returns An SVG string representing a unique, randomized symbol.
 */
export function generateRandomCardSymbol(baseOptions: Partial<CardSymbolOptions> = {}): string {
    // Generate a random, harmonious color palette if not provided
    const palette = baseOptions?.palette ? baseOptions?.palette 
      : ColorGenerator.generateHarmoniousPalette();
    
    // Randomize the assignment of colors. 50% chance for light-on-dark, 50% for dark-on-light.
    const isLightOnDark = Math.random() < 0.5;
    const randomBackgroundColor = isLightOnDark ? palette.medium : palette.light;
    const randomForegroundColor = isLightOnDark ? palette.light : palette.medium;
    
    // The outline should almost always be the darkest color for good definition.
    const randomOutlineColor = palette.dark;
    
    // Randomize the mirror option
    // const mirrorOptions: MirrorOption[] = ['none', 'vertical', 'horizontal', 'both'];
    const mirrorOptions: MirrorOption[] = ['vertical', 'horizontal', 'both'];
    const randomMirror = mirrorOptions[Math.floor(Math.random() * mirrorOptions.length)];

    // Randomize the outline width
    let randomOutlineWidth = 0;
    const symbolWidth = baseOptions.width || 100; // Use provided width or default
    // Scale outline width based on symbol size, maxing out at 5% of width.
    const maxOutline = Math.max(2, symbolWidth * 0.05);
    randomOutlineWidth = Math.random() * (maxOutline - 1) + 1;

    // Randomize the numPoints
    const foregroundNumPoints = Math.floor(Math.random() * 9) + 3;
    const backgroundNumPoints = Math.floor(Math.random() * 9) + 3;

    // Randomize the shape types
    const shapeOptions: ShapeOption[] = ['blob', 'star', 'convex'];
    const frontShapeType = shapeOptions[Math.floor(Math.random() * shapeOptions.length)];
    const backShapeType = shapeOptions[Math.floor(Math.random() * shapeOptions.length)];
    
    // Randomize the background
    const backgroundColor = palette.medium;

    // Create an object with all our randomized defaults
    const randomizedDefaults: Omit<CardSymbolOptions, 'width' | 'height'> = {
      ...baseOptions,
      frontShape: {
        type: baseOptions?.frontShape?.type ?? frontShapeType,
        fillColor: baseOptions?.frontShape?.fillColor ?? randomForegroundColor,
        outlineColor: baseOptions?.frontShape?.outlineColor ?? randomOutlineColor,
        outlineWidth: baseOptions?.frontShape?.outlineWidth ?? randomOutlineWidth,
        mirror: baseOptions?.frontShape?.mirror ?? randomMirror,
        numPoints: baseOptions?.frontShape?.numPoints ?? foregroundNumPoints,
        turbulence: baseOptions?.frontShape?.turbulence ?? 0.2,
        scale: baseOptions?.frontShape?.scale ?? 0.7,
      },
      backShape: {
        type: baseOptions?.backShape?.type ?? backShapeType,
        fillColor: baseOptions?.backShape?.fillColor ?? randomBackgroundColor,
        outlineColor: baseOptions?.backShape?.outlineColor ?? randomOutlineColor,
        outlineWidth: baseOptions?.backShape?.outlineWidth ?? randomOutlineWidth,
        mirror: baseOptions?.backShape?.mirror ?? randomMirror,
        numPoints: baseOptions?.backShape?.numPoints ?? backgroundNumPoints,
        turbulence: baseOptions?.backShape?.turbulence ?? 0.2,
      },
      backgroundType: baseOptions?.backgroundType ?? 'none',
      backgroundColor: baseOptions?.backgroundColor ?? backgroundColor,
    };
    
    const finalOptions: CardSymbolOptions = {
        ...randomizedDefaults,
    };

    return generateCardSymbol(finalOptions);
}

export function generateRandomArt(palette: ColorPalette): string {
    const svgString: string = generateRandomCardSymbol({
        width: 640, 
        height: 480, 
        frontShape: {
            type: 'blob',
            outlineWidth: 2, 
        },
        backShape: {
            outlineWidth: 2, 
        },
        backgroundType: 'solid',
        palette: palette,
    });
    return svgString;
}

export function generateRandomBadge(palette: ColorPalette): string {
  return generateRandomCardSymbol({
    width: 64, 
    height: 64, 
    frontShape: {
      type: 'convex',
      outlineWidth: 2, 
      mirror: 'none',
    },
    backShape: {
      outlineWidth: 2, 
    },
    palette: palette,
  });
}
