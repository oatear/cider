import { ColorGenerator, ColorPalette } from "./color-generator";

export type FrameOption = 'sharp' | 'rounded' | 'arched';
export type EdgeOption = 'straight' | 'ripped' | 'zigzag';

export interface DialogFrameOptions {
  /** The total width of the SVG in pixels. */
  width: number;
  /** The total height of the SVG in pixels. */
  height: number;
  /** The color for the main content area (inside the frame). */
  backColor: string;
  /** The color of the frame itself. */
  frontColor: string;
  /** The color for all outlines. */
  outlineColor: string;
  /** The width of the inner and outer outlines in pixels. */
  outlineWidth: number;
  /** The base shape of the frame. */
  frameOption: FrameOption;
  /** The texture/style of the frame's edges. */
  edgeOption: EdgeOption;
  /** The thickness of the frame, in pixels. 0 means no frame, just a filled shape. */
  frameWidth: number;
  /** A value from 0.0 to 1.0 to control the 'hand-drawn' or 'chaotic' look. */
  turbulence: number;
  /** If true, adds extra sketchy lines over the final shape for a hand-drawn effect. */
  resketch: boolean;
  /** The direction of the arch for 'arched' frames. 'up' or 'down'. */
  archDirection?: 'up' | 'down';
  /** The color palette */
  palette?: ColorPalette;
}

/**
 * Generates the "skeleton" points for the base shape (sharp, rounded, arched).
 * These points define the ideal, non-turbulent path.
 */
function generateSkeletonPoints(
    frame: FrameOption, 
    width: number, 
    height: number, 
    archDirection: 'up' | 'down' = 'up'
): {x: number, y: number}[] {
    const points: {x: number, y: number}[] = [];
    const cornerRadius = Math.min(width, height) * 0.15;

    switch (frame) {
        case 'arched': {
            // --- CORRECTED IMPLEMENTATION TO STAY WITHIN BOUNDS ---
            const archHeight = height * 0.3; // The amplitude of the curve
            const steps = 20;

            if (archDirection === 'up') {
                // Top edge: Moves from y=archHeight up to y=0 and back.
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const curve = Math.sin(t * Math.PI) * archHeight;
                    points.push({ x: t * width, y: archHeight - curve });
                }
                // Bottom edge: Moves from y=height up to y=height-archHeight and back.
                for (let i = steps; i >= 0; i--) {
                    const t = i / steps;
                    const curve = Math.sin(t * Math.PI) * archHeight;
                    points.push({ x: t * width, y: height - curve });
                }
            } else { // archDirection === 'down'
                // Top edge: Moves from y=0 down to y=archHeight and back.
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const curve = Math.sin(t * Math.PI) * archHeight;
                    points.push({ x: t * width, y: curve });
                }
                // Bottom edge: Moves from y=height-archHeight down to y=height and back.
                for (let i = steps; i >= 0; i--) {
                    const t = i / steps;
                    const curve = Math.sin(t * Math.PI) * archHeight;
                    points.push({ x: t * width, y: (height - archHeight) + curve });
                }
            }
            break;
        }
            
        case 'rounded': { // Wrapped in a block for local const declarations
            // --- CORRECTED IMPLEMENTATION ---
            // We add intermediate points on the arc of each corner to guide the spline.
            const cr = cornerRadius;
            const w = width;
            const h = height;

            // Start at top-left, after the corner
            points.push({ x: cr, y: 0 });
            // Top edge
            points.push({ x: w - cr, y: 0 });

            // Top-right corner (add points at 30° and 60° into the 90° arc)
            // Angles are relative to the arc's center, starting from -90° (up)
            points.push({ x: (w - cr) + cr * Math.cos(-Math.PI / 3), y: cr + cr * Math.sin(-Math.PI / 3) }); // -60 deg
            points.push({ x: (w - cr) + cr * Math.cos(-Math.PI / 6), y: cr + cr * Math.sin(-Math.PI / 6) }); // -30 deg
            
            // Right edge
            points.push({ x: w, y: cr });
            points.push({ x: w, y: h - cr });

            // Bottom-right corner
            points.push({ x: (w - cr) + cr * Math.cos(Math.PI / 6), y: (h - cr) + cr * Math.sin(Math.PI / 6) }); // 30 deg
            points.push({ x: (w - cr) + cr * Math.cos(Math.PI / 3), y: (h - cr) + cr * Math.sin(Math.PI / 3) }); // 60 deg

            // Bottom edge
            points.push({ x: w - cr, y: h });
            points.push({ x: cr, y: h });

            // Bottom-left corner
            points.push({ x: cr + cr * Math.cos(Math.PI * 2 / 3), y: (h - cr) + cr * Math.sin(Math.PI * 2 / 3) }); // 120 deg
            points.push({ x: cr + cr * Math.cos(Math.PI * 5 / 6), y: (h - cr) + cr * Math.sin(Math.PI * 5 / 6) }); // 150 deg

            // Left edge
            points.push({ x: 0, y: h - cr });
            points.push({ x: 0, y: cr });

            // Top-left corner
            points.push({ x: cr + cr * Math.cos(Math.PI * 7 / 6), y: cr + cr * Math.sin(Math.PI * 7 / 6) }); // 210 deg
            points.push({ x: cr + cr * Math.cos(Math.PI * 4 / 3), y: cr + cr * Math.sin(Math.PI * 4 / 3) }); // 240 deg

            break;
        }
            
        case 'sharp':
        default:
            points.push({ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height });
            break;
    }
    return points;
}

/**
 * Takes a set of skeleton points and applies a textured edge style to them.
 */
function applyEdgeStyle(skeleton: {x: number, y: number}[], edge: EdgeOption, turbulence: number): {x: number, y: number}[] {
    const finalPoints: {x: number, y: number}[] = [];
    if (turbulence === 0 && edge !== 'zigzag') return skeleton;

    skeleton.forEach((p1, i) => {
        finalPoints.push(p1);
        const p2 = skeleton[(i + 1) % skeleton.length];
        const segment = { x: p2.x - p1.x, y: p2.y - p1.y };
        const len = Math.sqrt(segment.x**2 + segment.y**2);
        if (len === 0) return;
        
        const perp = { x: -segment.y / len, y: segment.x / len };
        const subdivisions = edge === 'ripped' ? 10 : 5;

        for (let j = 1; j <= subdivisions; j++) {
            const t = j / (subdivisions + 1);
            const pt = { x: p1.x + segment.x * t, y: p1.y + segment.y * t };
            let displacedPt = { ...pt };

            switch(edge) {
                case 'ripped':
                    if (Math.random() < 0.3) {
                        const displacement = (Math.random() - 0.5) * len * 0.3 * turbulence;
                        displacedPt = { x: pt.x + perp.x * displacement, y: pt.y + perp.y * displacement };
                    }
                    break;
                case 'zigzag':
                    const amplitude = len * 0.02;
                    const zigOffset = (j % 2 === 0 ? 1 : -1) * amplitude * (1 - turbulence*0.8);
                    displacedPt = { x: pt.x + perp.x * zigOffset, y: pt.y + perp.y * zigOffset };
                    break;
                case 'straight':
                default:
                    const displacement = (Math.random() - 0.5) * len * 0.2 * turbulence;
                    displacedPt = { x: pt.x + perp.x * displacement, y: pt.y + perp.y * displacement };
                    break;
            }
            finalPoints.push(displacedPt);
        }
    });
    return finalPoints;
}

/**
 * Converts an array of points to an SVG path data string, choosing the
 * rendering style based on the selected edge option.
 *
 * @param points The array of {x, y} coordinates.
 * @param edge The edge style, which determines if we use sharp lines or smooth curves.
 * @returns An SVG path data string.
 */
function pointsToSharpPathString(points: {x: number, y: number}[], edge: EdgeOption): string {
    if (points.length < 2) return "M0,0Z";

    // --- NEW LOGIC: Use straight lines for jagged/sharp edge styles ---
    if (edge === 'ripped' || edge === 'zigzag') {
        let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x.toFixed(2)},${points[i].y.toFixed(2)}`;
        }
        return d + 'Z'; // Close the path with a straight line
    } else {
        // For 'straight' and 'rounded', we use smooth curves
        return pointsToSmoothPathString(points);
    }
}


/**
 * Converts an array of points to a smooth SVG path data string.
 */
function pointsToSmoothPathString(points: {x: number, y: number}[]): string {
    let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
    const len = points.length;
    for (let i = 0; i < len; i++) {
        const p0 = points[(i - 1 + len) % len];
        const p1 = points[i];
        const p2 = points[(i + 1) % len];
        const p3 = points[(i + 2) % len];
        const cp1x = p1.x + (p2.x - p0.x) / 6; const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6; const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d + 'Z';
}

/**
 * Generates an SVG string of a dialog/textbox based on a new set of modular options.
 *
 * @param options The configuration for the dialog frame.
 * @returns An SVG string.
 */
export function generateDialogFrame(options: DialogFrameOptions): string {
  const {
    width, height, backColor, frontColor, outlineColor, outlineWidth,
    frameOption, edgeOption, frameWidth, turbulence, resketch,
    archDirection = 'up'
  } = options;

  let frameElements = '';
  let resketchElements = '';  // Separate string for sketch lines
  
  // 1. Calculate a safe drawing area to prevent clipping
  let margin = 0;

  // 1. Account for the main stroke width.
  // The stroke is centered on the path, so it spills out by half its width.
  if (frameWidth > 0) {
    // The thickest stroke is the outline-colored one.
    // Its visual width is `frameWidth * 2 + outlineWidth`.
    // It spills out by half of that: `frameWidth + outlineWidth / 2`.
    margin += frameWidth + (outlineWidth / 2);
  } else {
    // If there's no frame, the only stroke is the simple outline.
    margin += outlineWidth / 2;
  }

  // 2. Account for turbulence. This creates unpredictable spill-over.
  // We'll add a buffer based on the largest dimension, scaled by the turbulence factor.
  // A 5% buffer at max turbulence is a safe bet.
  const turbulenceBuffer = Math.max(width, height) * 0.05 * turbulence;
  margin += turbulenceBuffer;

  // 3. Account for the small offset of the 'resketch' lines.
  if (resketch) {
    // The resketch stroke is `outlineWidth * 0.6`, so we add half of that plus a small fixed buffer.
    margin += (outlineWidth * 0.3) + 1;
  }
  
  // 4. Add a final minimum safety buffer of a couple of pixels.
  margin += 2;

  // --- End of new margin calculation ---

  const canvas = {
    x: margin, y: margin,
    width: width - margin * 2, height: height - margin * 2
  };
  if (canvas.width <= 0 || canvas.height <= 0) return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" />`;
  const transform = `transform="translate(${canvas.x}, ${canvas.y})"`;
  
  // 2. Generate the path data
  const skeletonPoints = generateSkeletonPoints(frameOption, canvas.width, canvas.height, archDirection);
  const styledPoints = applyEdgeStyle(skeletonPoints, edgeOption, turbulence);
  const pathData = pointsToSharpPathString(styledPoints, edgeOption);
  
  // 3. Assemble SVG elements based on options
  if (frameWidth <= 0) {
    // --- Case 1: No frame, just a filled shape with an outline ---
    frameElements = `<path d="${pathData}" fill="${backColor}" stroke="${outlineColor}" stroke-width="${outlineWidth}" />`;
  } else {
    // --- Case 2: A frame with inner and outer borders ---
    // We use a clever SVG stroke technique to create the frame.
    // 1. Draw a very thick line with the outline color.
    // 2. Draw a slightly less thick line with the frame color on top.
    // 3. Draw a final thin line for the inner outline.
    // 4. Fill the whole shape with the background color.
    const frameStrokeWidth = frameWidth * 2 + outlineWidth;
    const innerStrokeWidth = frameWidth * 2 - outlineWidth;
    
    frameElements = `
      <g fill="${backColor}">
        <path d="${pathData}" stroke="${outlineColor}" stroke-width="${frameStrokeWidth}" />
        <path d="${pathData}" stroke="${frontColor}" stroke-width="${innerStrokeWidth}" />
        <path d="${pathData}" /> 
      </g>
    `;
  }

  // 4. Apply the 'resketch' effect if requested
  if (resketch) {
    const sketchTransform1 = `transform="translate(0.5, -0.5) rotate(0.1)"`;
    const sketchTransform2 = `transform="translate(-0.5, 0.5) rotate(-0.1)"`;
    const resketchStroke = `stroke="${outlineColor}" stroke-width="${outlineWidth * 0.6}" opacity="0.7" fill="none"`;

    // Wrap each sketchy path in its own <g> with the small transform.
    // The path itself no longer has a transform attribute.
    resketchElements = `
      <g ${sketchTransform1}>
        <path d="${pathData}" ${resketchStroke} />
      </g>
      <g ${sketchTransform2}>
        <path d="${pathData}" ${resketchStroke} />
      </g>
    `;
  }
  // Removed width="${width}" height="${height}" and added preserveAspectRatio="none"
  // in order to scale the image to the container
  return `
<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <g ${transform}>
    ${frameElements}
    ${resketchElements}
  </g>
</svg>
  `.trim();
}

export function generateRandomDialogFrame(baseOptions: Partial<DialogFrameOptions> = {}): string {
        // Generate a random, harmonious color palette if not provided
    const palette = baseOptions?.palette ? baseOptions?.palette 
      : ColorGenerator.generateHarmoniousPalette();
    const finalWidth = baseOptions.width ?? Math.floor(Math.random() * 200 + 200);
    const finalHeight = baseOptions.height ?? Math.floor(Math.random() * 150 + 100);

    const frameOptions: FrameOption[] = ['sharp', 'rounded', 'arched'];
    const edgeOptions: EdgeOption[] = ['straight', 'ripped', 'zigzag'];

    const randomizedDefaults = {
        backColor: baseOptions?.backColor ?? palette.back,
        frontColor: baseOptions?.frontColor ?? palette.front,
        outlineColor: baseOptions?.outlineColor ?? palette.outline,
        outlineWidth: baseOptions?.outlineWidth ?? Math.random() * 2 + 1, // 1-3px
        frameOption: baseOptions?.frameOption ?? frameOptions[Math.floor(Math.random() * frameOptions.length)],
        edgeOption: baseOptions?.edgeOption ?? edgeOptions[Math.floor(Math.random() * edgeOptions.length)],
        frameWidth: baseOptions?.frameWidth ?? (Math.random() < 0.4 ? 0 : Math.random() * 20 + 5), // 40% chance of no frame
        turbulence: baseOptions?.turbulence ?? Math.random() * 0.8,
        resketch: baseOptions?.resketch ?? Math.random() < 0.5,
    };

    const finalOptions: DialogFrameOptions = {
        width: finalWidth, height: finalHeight,
        ...randomizedDefaults,
    };

    return generateDialogFrame(finalOptions);
}

export function generateRandomBanner(baseOptions: Partial<DialogFrameOptions> = {}) {
  return generateRandomDialogFrame({
    width: 640,
    height: 120,
    outlineWidth: 4,
    turbulence: 0.1,
    frameOption: 'rounded',
    edgeOption: 'ripped',
    frameWidth: 0,
    resketch: true,
    palette: baseOptions.palette ?? ColorGenerator.generateHarmoniousPalette(),
    ...baseOptions
  });
}

export function generateRandomTextbox(baseOptions: Partial<DialogFrameOptions> = {}) {
  return generateRandomDialogFrame({
    width: 640,
    height: 320,
    outlineWidth: 4,
    turbulence: 0.1,
    frameOption: 'rounded',
    edgeOption: 'ripped',
    frameWidth: 0,
    resketch: true,
    palette: baseOptions.palette ?? ColorGenerator.generateHarmoniousPalette(),
    ...baseOptions
  });
}