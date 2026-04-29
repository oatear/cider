import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import init, { apply_soft_proof } from '../../lib/cider-press/cider_press';

@Injectable({
  providedIn: 'root'
})
export class ColorManagementService {
  private profilesLoaded = false;
  private wasmReady = false;
  private wasmInitPromise: Promise<void> | null = null;
  private availableProfiles: string[] = [];

  // Cache loaded ICC profile bytes to avoid re-fetching
  private loadedProfileBytes: Map<string, Uint8Array> = new Map();

  constructor(private http: HttpClient) { }

  /**
   * Initializes the service. Loads profiles first to unblock UI, then initializes WASM.
   */
  async initialize(): Promise<void> {
    // 1. Load profiles if not already loaded
    if (!this.profilesLoaded) {
      try {
        console.log('ColorManagementService: Fetching profiles from ./assets/icc/profiles.json');
        this.availableProfiles = await firstValueFrom(this.http.get<string[]>('./assets/icc/profiles.json'));
        this.profilesLoaded = true;
        console.log('ColorManagementService: Profiles loaded successfully:', this.availableProfiles);
      } catch (e) {
        console.error('ColorManagementService: Failed to load profiles.json from ./assets/icc/profiles.json', e);
      }
    }

    // 2. Initialize WASM if not already ready
    if (!this.wasmReady) {
      if (!this.wasmInitPromise) {
        const wasmPath = './assets/wasm/cider_press_bg.wasm';
        console.log(`ColorManagementService: Initializing WASM from ${wasmPath}`);
        this.wasmInitPromise = init(wasmPath).then(() => {
          this.wasmReady = true;
          console.log('ColorManagementService: WASM module initialized successfully.');
        }).catch((err: any) => {
          console.error(`ColorManagementService: WASM initialization failed for ${wasmPath}`, err);
          this.wasmInitPromise = null; // Allow retry
          throw err;
        });
      }
      await this.wasmInitPromise;
    }
  }

  /**
   * Returns the list of detected ICC profiles.
   */
  async getAvailableProfiles(): Promise<string[]> {
    if (!this.profilesLoaded) {
      // Just try to load profiles, don't necessarily block on WASM here
      try {
        this.availableProfiles = await firstValueFrom(this.http.get<string[]>('./assets/icc/profiles.json'));
        this.profilesLoaded = true;
      } catch (e) {
        console.error('ColorManagementService: Failed to load profiles for dropdown from ./assets/icc/profiles.json', e);
      }
    }
    return this.availableProfiles;
  }

  /**
   * Applies the soft proofing ICC transform to the given ImageData using cider-press.
   *
   * Uses the real cmsCreateProofingTransform internally via the Rust/WASM bridge,
   * with 16-bit intermediate precision to eliminate quantization artifacts.
   * Black Point Compensation and Absolute Colorimetric simulation intent are
   * handled natively by the bridge.
   *
   * Modifies the imageData array in place and returns it.
   */
  async applySoftProof(
    imageData: ImageData,
    profileName: string,
    intent: number = 1, // 1 = RelativeColorimetric
    simulatePaper: boolean = false
  ): Promise<ImageData> {
    if (!this.wasmReady) {
      await this.initialize();
    }

    if (!this.wasmReady || profileName === 'none') {
      return imageData;
    }

    // 1. Ensure target profile bytes are loaded
    let profileBytes = this.loadedProfileBytes.get(profileName);
    if (!profileBytes) {
      try {
        const profilePath = `./assets/icc/${profileName}.icc`;
        const buffer = await firstValueFrom(this.http.get(profilePath, { responseType: 'arraybuffer' }));
        profileBytes = new Uint8Array(buffer);
        this.loadedProfileBytes.set(profileName, profileBytes);
      } catch (e) {
        console.error(`ColorManagementService: Failed to load profile ${profileName}`, e);
        return imageData;
      }
    }

    // 2. Apply soft proofing via cider-press (native proofing transform)
    try {
      const pixels = new Uint8Array(imageData.data);
      console.log('ColorManagementService: Applying soft proof for', profileName, 'Size:', imageData.width, 'x', imageData.height);
      console.log('ColorManagementService: Source pixels sample:', pixels.slice(0, 16));

      const result = apply_soft_proof(
        pixels,
        imageData.width,
        imageData.height,
        profileBytes,
        intent
      );

      if (!result || result.length === 0) {
        console.error('ColorManagementService: apply_soft_proof returned empty result');
        return imageData;
      }

      console.log('ColorManagementService: Result pixels sample:', result.slice(0, 16));

      // 3. Restore alpha channel (LittleCMS often zeroes it out as it's not part of the ICC color space)
      for (let i = 3; i < result.length; i += 4) {
        result[i] = pixels[i];
      }

      // 4. Update the ImageData buffer with transformed pixels
      imageData.data.set(result);
      return imageData;
    } catch (e) {
      console.error('ColorManagementService: Failed to apply soft proof transform', e);
      return imageData;
    }
  }
}
