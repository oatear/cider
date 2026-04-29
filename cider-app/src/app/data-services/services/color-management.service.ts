import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import init, { SoftProofer } from 'cider-press';

export interface IccProfile {
  file: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColorManagementService {
  private profilesLoaded = false;
  private wasmReady = false;
  private wasmInitPromise: Promise<void> | null = null;
  private availableProfiles: IccProfile[] = [];

  // Cache SoftProofer instances per profile/intent combination
  private proofers: Map<string, SoftProofer> = new Map();

  constructor(private http: HttpClient) { }

  /**
   * Initializes the service. Loads profiles first to unblock UI, then initializes WASM.
   */
  async initialize(): Promise<void> {
    // 1. Load profiles if not already loaded
    if (!this.profilesLoaded) {
      try {
        console.log('ColorManagementService: Fetching profiles from ./assets/icc/profiles.json');
        this.availableProfiles = await firstValueFrom(this.http.get<IccProfile[]>('./assets/icc/profiles.json'));
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
  async getAvailableProfiles(): Promise<IccProfile[]> {
    if (!this.profilesLoaded) {
      try {
        this.availableProfiles = await firstValueFrom(this.http.get<IccProfile[]>('./assets/icc/profiles.json'));
        this.profilesLoaded = true;
      } catch (e) {
        console.error('ColorManagementService: Failed to load profiles for dropdown from ./assets/icc/profiles.json', e);
      }
    }
    return this.availableProfiles;
  }

  /**
   * Applies the soft proofing ICC transform and post-processing to the given ImageData.
   */
  async applySoftProof(
    imageData: ImageData,
    profileName: string,
    intent: number = 1, // 1 = RelativeColorimetric
    options: any = {}
  ): Promise<ImageData> {
    if (!this.wasmReady) {
      await this.initialize();
    }

    if (!this.wasmReady || profileName === 'none') {
      return imageData;
    }

    const prooferKey = `${profileName}_${intent}`;
    let proofer = this.proofers.get(prooferKey);

    if (!proofer) {
      try {
        const profilePath = `./assets/icc/${profileName}.icc`;
        const buffer = await firstValueFrom(this.http.get(profilePath, { responseType: 'arraybuffer' }));
        const profileBytes = new Uint8Array(buffer);

        console.log('ColorManagementService: Creating new SoftProofer for', profileName);
        // Default to high precision (16-bit intermediate) for all soft proofing
        proofer = new SoftProofer(profileBytes, intent, true);
        this.proofers.set(prooferKey, proofer);
      } catch (e) {
        console.error(`ColorManagementService: Failed to initialize proofer for ${profileName}`, e);
        return imageData;
      }
    }

    // Apply soft proofing via cider-press (native proofing transform + post-processing)
    try {
      const pixels = new Uint8Array(imageData.data);
      const result = proofer.apply(pixels, imageData.width, imageData.height, options);

      if (!result || result.length === 0) {
        console.error('ColorManagementService: proofer.apply returned empty result');
        return imageData;
      }

      // Update the ImageData buffer with transformed pixels
      imageData.data.set(result);
      return imageData;
    } catch (e) {
      console.error('ColorManagementService: Failed to apply soft proof transform', e);
      return imageData;
    }
  }
}
