import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  initWasm, 
  cmsOpenProfileFromMem, 
  cmsCreateTransform, 
  cmsDoTransform, 
  cmsGetColorSpace,
  IccColorSpaceMap,
  CmsIntent, 
  cmsHPROFILE, 
  cmsHTRANSFORM 
} from '@kittl/little-cms';
import { 
  iniFormatter, 
  setColorSpace, 
  setChannels, 
  setExtraSample, 
  setBytesPerSample, 
  ColorSpaceCode 
} from '@kittl/little-cms/formatter';
// Flags is not exported nicely from the root, let's just use 0 as a flag
const NO_FLAGS = 0 as any;

@Injectable({
  providedIn: 'root'
})
export class ColorManagementService {
  private isInitialized = false;
  private sRgbProfile?: cmsHPROFILE;
  private colorLaserProfile?: cmsHPROFILE;
  private bwLaserProfile?: cmsHPROFILE;

  // Caching transforms for performance
  private transforms: Map<string, cmsHTRANSFORM> = new Map();

  constructor(private http: HttpClient) {}

  /**
   * Initializes the WASM module and loads the necessary ICC profiles.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load the WASM module — provide an explicit path since Angular bundles JS
    // but doesn't automatically resolve WASM files relative to import.meta.url.
    // The WASM binary is copied to assets/wasm/ via angular.json assets config.
    const result = await initWasm('assets/wasm/lcms.wasm');
    if (result.value === undefined) {
      console.error('Failed to initialize little-cms WASM', result.error);
      return;
    }

    try {
      // Load standard sRGB profile
      const srgbBuffer = await firstValueFrom(this.http.get('assets/icc/sRGB.icc', { responseType: 'arraybuffer' }));
      const srgbRes = cmsOpenProfileFromMem(new Uint8Array(srgbBuffer));
      if (srgbRes.value !== undefined) this.sRgbProfile = srgbRes.value;

      // Load Color Laser profile
      const colorLaserBuffer = await firstValueFrom(this.http.get('assets/icc/ColorLaser.icc', { responseType: 'arraybuffer' }));
      const colorLaserRes = cmsOpenProfileFromMem(new Uint8Array(colorLaserBuffer));
      if (colorLaserRes.value !== undefined) this.colorLaserProfile = colorLaserRes.value;

      // Load B/W Laser profile
      const bwLaserBuffer = await firstValueFrom(this.http.get('assets/icc/BWLaser.icc', { responseType: 'arraybuffer' }));
      const bwLaserRes = cmsOpenProfileFromMem(new Uint8Array(bwLaserBuffer));
      if (bwLaserRes.value !== undefined) this.bwLaserProfile = bwLaserRes.value;
      
      console.log('ICC Profiles loaded:', {
        sRGB: !!this.sRgbProfile,
        colorLaser: !!this.colorLaserProfile,
        bwLaser: !!this.bwLaserProfile
      });

      this.isInitialized = true;
    } catch (e) {
      console.error('Failed to load ICC profiles', e);
    }
  }

  /**
   * Applies the soft proofing ICC transform to the given ImageData.
   * Modifies the imageData array in place and returns it.
   */
  async applySoftProof(imageData: ImageData, mode: string): Promise<ImageData> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized || !this.sRgbProfile) {
      console.warn('ColorManagementService is not properly initialized. Returning original image data.');
      return imageData;
    }

    let targetProfile: cmsHPROFILE | undefined;
    if (mode === 'color-laser') {
      targetProfile = this.colorLaserProfile;
    } else if (mode === 'bw-laser') {
      targetProfile = this.bwLaserProfile;
    }

    if (!targetProfile) {
      return imageData;
    }

    // Get or create transform
    const transformKey = mode;
    let transform = this.transforms.get(transformKey);

    if (!transform) {
      // 1. Define RGBA Formatter (Source/Destination)
      let rgbaFormatter = iniFormatter();
      rgbaFormatter = setColorSpace(rgbaFormatter, ColorSpaceCode.PT_RGB);
      rgbaFormatter = setChannels(rgbaFormatter, 3);
      rgbaFormatter = setExtraSample(rgbaFormatter, 1);
      rgbaFormatter = setBytesPerSample(rgbaFormatter, 1);

      // 2. Determine Target Formatter based on Profile Color Space
      const colorSpaceRes = cmsGetColorSpace(targetProfile);
      console.log(`Creating transform for ${mode}. Target color space:`, colorSpaceRes.value);
      let targetFormatter = iniFormatter();
      targetFormatter = setBytesPerSample(targetFormatter, 1);

      if (colorSpaceRes.value === IccColorSpaceMap.CMYK) {
        targetFormatter = setColorSpace(targetFormatter, ColorSpaceCode.PT_CMYK);
        targetFormatter = setChannels(targetFormatter, 4);
      } else if (colorSpaceRes.value === IccColorSpaceMap.GRAY) {
        targetFormatter = setColorSpace(targetFormatter, ColorSpaceCode.PT_GRAY);
        targetFormatter = setChannels(targetFormatter, 1);
      } else {
        // Fallback to RGB if unknown
        targetFormatter = setColorSpace(targetFormatter, ColorSpaceCode.PT_RGB);
        targetFormatter = setChannels(targetFormatter, 3);
      }

      // 3. Create Two-Pass Soft Proof Transform
      // Pass 1: sRGB (RGBA) -> Target Profile (CMYK/Gray)
      const t1 = cmsCreateTransform(
        this.sRgbProfile, rgbaFormatter, 
        targetProfile, targetFormatter,
        CmsIntent.Percepttual, NO_FLAGS
      );

      // Pass 2: Target Profile (CMYK/Gray) -> sRGB (RGBA)
      const t2 = cmsCreateTransform(
        targetProfile, targetFormatter,
        this.sRgbProfile, rgbaFormatter,
        CmsIntent.RelativeColorimetric, NO_FLAGS
      );

      if (t1.value !== undefined && t2.value !== undefined) {
        this.transforms.set(transformKey + '_1', t1.value);
        this.transforms.set(transformKey + '_2', t2.value);
      } else {
        console.error('Failed to create ICC transform', t1.error, t2.error);
        return imageData;
      }
    }

    const t1 = this.transforms.get(transformKey + '_1');
    const t2 = this.transforms.get(transformKey + '_2');

    if (t1 && t2) {
      const pixelCount = imageData.width * imageData.height;
      // Pass 1: sRGB -> Target
      const res1 = cmsDoTransform(t1, new Uint8Array(imageData.data.buffer), pixelCount);
      if (res1.value !== undefined) {
        // Pass 2: Target -> sRGB
        const res2 = cmsDoTransform(t2, res1.value, pixelCount);
        if (res2.value !== undefined) {
          // Copy back to imageData
          imageData.data.set(res2.value);
          
          // Apply post-processing effects to match user's Affinity Photo settings
          if (mode === 'color-laser' || mode === 'bw-laser') {
            const data = imageData.data;
            
            // 1. Crush Black (Levels)
            // Black: 10% (25.5), White: 70% (178.5), Gamma: 0.75
            this.applyLevels(data, 25.5, 178.5, 0.75);
            
            // 2. Posterize
            // Levels: 30
            this.applyPosterize(data, 30);
          }
        }
      }
    }

    return imageData;
  }

  private applyLevels(data: Uint8ClampedArray, black: number, white: number, gamma: number) {
    const invGamma = 1 / gamma;
    const range = white - black;
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        let v = data[i + j];
        // Normalize and apply black/white levels
        v = Math.max(0, Math.min(255, ((v - black) / range) * 255));
        // Apply Gamma
        v = Math.pow(v / 255, invGamma) * 255;
        data[i + j] = v;
      }
    }
  }

  private applyPosterize(data: Uint8ClampedArray, levels: number) {
    const step = 255 / (levels - 1);
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        data[i + j] = Math.round(data[i + j] / step) * step;
      }
    }
  }
}
