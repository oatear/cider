/* tslint:disable */
/* eslint-disable */

/**
 * Apply a soft-proofing transform to RGBA pixel data.
 *
 * Simulates how `source_pixels` (assumed sRGB) would appear when printed
 * on the device described by `printer_profile_icc`, then converts back
 * to the monitor's sRGB space for on-screen preview.
 *
 * # Arguments
 * * `pixels` — Source RGBA pixel data (8-bit per channel, 4 bytes per pixel)
 * * `width` — Image width in pixels
 * * `height` — Image height in pixels
 * * `printer_profile_icc` — Raw ICC profile bytes for the target printer
 * * `intent` — Rendering intent (0=Perceptual, 1=RelativeColorimetric,
 *               2=Saturation, 3=AbsoluteColorimetric)
 *
 * # Returns
 * Transformed RGBA pixel data as a new `Vec<u8>`.
 */
export function apply_soft_proof(pixels: Uint8Array, width: number, height: number, printer_profile_icc: Uint8Array, intent: number): Uint8Array;

/**
 * Apply a soft-proofing transform using 16-bit intermediate precision.
 *
 * Same as `apply_soft_proof` but operates at 16-bit per channel internally
 * to avoid quantization artifacts. Input/output are still 8-bit RGBA.
 */
export function apply_soft_proof_16bit(pixels: Uint8Array, width: number, height: number, printer_profile_icc: Uint8Array, intent: number): Uint8Array;

/**
 * Initialize panic hook for better browser console errors (debug builds).
 */
export function init(): void;

/**
 * Simple profile-to-profile color transform (no proofing).
 */
export function transform_pixels(pixels: Uint8Array, width: number, height: number, source_profile_icc: Uint8Array, dest_profile_icc: Uint8Array, intent: number): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly apply_soft_proof: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly apply_soft_proof_16bit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly transform_pixels: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
    readonly init: () => void;
    readonly __wbindgen_export: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
